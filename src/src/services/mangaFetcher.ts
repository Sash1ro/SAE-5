import axios from 'axios';
import { cleanResume } from '@/utils/cleanResume';
import { getCache, setCache } from '@/services/cacheService';
import { formatToStub } from '@/utils/utils';

const MANGADEX_API = 'https://api.mangadex.org';
const COVER_BASE_URL = 'https://uploads.mangadex.org/covers';
const CACHE_PREFIX = '@manga_fetcher_cache_v4_';

const SEARCH_LIMIT = 30;
const FEED_PAGE_SIZE = 500;
const FEED_MAX_PAGES = 5;
const MIN_SCORE = 20;

const PENALIZED_TAG_NAMES = [
    'anthology',
    '4-koma',
    'official colored',
    'fan colored',
];

const DERIVATIVE_RELATIONS = new Set(['main_story', 'based_on', 'adapted_from', 'monochrome']);

const VARIANT_REGEX =
    /\b(colou?red|anthology|fan ?book|spin ?off|4 ?koma|art ?book|official (guide|anthology|comic)|gaiden|side stor(y|ies)|omake|parody|doujin(shi)?|character book|data ?book|light novel|novel)\b/;

export type Manga = {
    mangaId: string;
    title: string;
    type: string;
    status: string;
    resume: string;
    author: string;
    tags: string[];
    volumeCoverUrl: string | null;
    chapters: Array<{ chapterId: string; title: string; chapter: number }> | null;
};

function generateCacheKey(universe: string, tome: number): string {
    return formatToStub(`${CACHE_PREFIX}${universe.trim().toLowerCase()}_${tome}`);
}

const normalize = (s: string): string =>
    s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

function getTagNames(attrs: any): string[] {
    return (attrs.tags || []).map((t: any) => (t.attributes?.name?.en ?? '').toLowerCase());
}

function getTitles(attrs: any): { main: string[]; alts: string[] } {
    const main = Object.values(attrs.title || {}) as string[];
    const alts = (attrs.altTitles || []).flatMap((o: any) => Object.values(o) as string[]);
    return { main, alts };
}

function scoreTitle(query: string, candidate: string): number {
    if (!candidate) return 0;
    if (candidate === query) return 100;

    const qTokens = query.split(' ');
    const cTokens = candidate.split(' ');
    const cSet = new Set(cTokens);
    const extra = Math.max(cTokens.length - qTokens.length, 0);
    const extraPenalty = Math.min(extra * 1.5, 20);

    let score: number;

    if (candidate.startsWith(query + ' ')) {
        score = 75 - extraPenalty;
    } else if (qTokens.every((t) => cSet.has(t))) {
        score = 60 - extraPenalty;
    } else {
        const q = new Set(qTokens);
        const inter = [...q].filter((t) => cSet.has(t)).length;
        const union = new Set([...q, ...cSet]).size;
        score = (inter / union) * 80;
    }

    if (VARIANT_REGEX.test(candidate) && !VARIANT_REGEX.test(query)) score -= 30;
    return Math.max(score, 0);
}

function isHardExcluded(manga: any): boolean {
    const attrs = manga.attributes;
    if (['pornographic', 'erotica'].includes(attrs.contentRating)) return true;
    if (attrs.publicationDemographic === 'doujinshi') return true;
    return getTagNames(attrs).includes('doujinshi');
}

function isDerivative(manga: any): boolean {
    return (manga.relationships || []).some(
        (r: any) => r.type === 'manga' && DERIVATIVE_RELATIONS.has(r.related)
    );
}

function hasExactMainTitle(query: string, attrs: any): boolean {
    return getTitles(attrs).main.some((t) => normalize(t) === query);
}

function scoreManga(query: string, manga: any, index: number): number {
    const attrs = manga.attributes;

    if (hasExactMainTitle(query, attrs)) {
        return 100 - index * 0.5;
    }

    const { main, alts } = getTitles(attrs);
    const mainBest = Math.max(...main.map((t) => scoreTitle(query, normalize(t))), 0);
    const altBest = Math.max(...alts.map((t) => scoreTitle(query, normalize(t))), 0) * 0.95;

    let score = Math.max(mainBest, altBest);

    const tagNames = getTagNames(attrs);
    if (isDerivative(manga)) score -= 40;
    if (PENALIZED_TAG_NAMES.some((t) => tagNames.includes(t))) score -= 35;
    if (tagNames.includes('oneshot')) score -= 15;

    return score - index * 0.5;
}

function findMangaBestResult(title: string, mangas: any[]): any | null {
    const query = normalize(title);

    const scored = mangas
        .map((manga, index) => ({
            manga,
            score: isHardExcluded(manga) ? -Infinity : scoreManga(query, manga, index),
        }))
        .filter((s) => s.score >= MIN_SCORE)
        .sort((a, b) => b.score - a.score);

    return scored[0]?.manga ?? null;
}

async function fetchMangaByTitle(title: string): Promise<any | null> {
    try {
        const res = await axios.get(`${MANGADEX_API}/manga`, {
            params: {
                title,
                'includes[]': ['author', 'cover_art'],
                'order[relevance]': 'desc',
                'contentRating[]': ['safe', 'suggestive'],
                limit: SEARCH_LIMIT,
            },
        });

        const mangas = res.data?.data;
        if (!mangas || mangas.length === 0) return null;

        return findMangaBestResult(title, mangas);
    } catch (error) {
        console.error('[mangaFetcher] search failed', error);
        return null;
    }
}

async function fetchVolumeCoverUrl(
    mangaId: string,
    volume: string,
    defaultFileName?: string
): Promise<string | null> {
    try {
        const res = await axios.get(`${MANGADEX_API}/cover`, {
            params: {
                'manga[]': [mangaId],
                'order[volume]': 'asc',
                limit: 100,
            },
        });

        const covers: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
        const forVolume = covers.filter((c) => c.attributes?.volume === volume);

        const best =
            forVolume.find((c) => c.attributes?.locale === 'en') ??
            forVolume.find((c) => c.attributes?.locale === 'ja') ??
            forVolume[0];

        if (best?.attributes?.fileName) {
            return `${COVER_BASE_URL}/${mangaId}/${best.attributes.fileName}`;
        }
    } catch (error) {
        console.error('[mangaFetcher] cover fetch failed', error);
    }

    return defaultFileName ? `${COVER_BASE_URL}/${mangaId}/${defaultFileName}` : null;
}

async function fetchAllFeed(mangaId: string): Promise<any[]> {
    const all: any[] = [];

    for (let page = 0; page < FEED_MAX_PAGES; page++) {
        const offset = page * FEED_PAGE_SIZE;
        const res = await axios.get(`${MANGADEX_API}/manga/${mangaId}/feed`, {
            params: {
                limit: FEED_PAGE_SIZE,
                offset,
                'translatedLanguage[]': ['en'],
                'order[chapter]': 'asc',
            },
        });

        const data = res.data?.data;
        if (!Array.isArray(data) || data.length === 0) break;
        all.push(...data);

        const total = res.data?.total ?? 0;
        if (offset + FEED_PAGE_SIZE >= total) break;
    }

    return all;
}

async function fetchVolumeChapters(mangaId: string, volume: string) {
    try {
        const allChapters = await fetchAllFeed(mangaId);

        const byNumber = new Map<number, { chapterId: string; title: string; chapter: number }>();

        for (const c of allChapters) {
            const a = c.attributes;
            if (a.volume !== volume || a.chapter == null) continue;

            const num = Number(a.chapter);
            if (Number.isNaN(num) || byNumber.has(num)) continue;

            byNumber.set(num, {
                chapterId: c.id,
                title: a.title || `Chapter ${a.chapter}`,
                chapter: num,
            });
        }

        if (byNumber.size === 0) return null;
        return [...byNumber.values()].sort((a, b) => a.chapter - b.chapter);
    } catch (error) {
        console.error('[mangaFetcher] chapters fetch failed', error);
        return null;
    }
}

function extractMangaMetadata(manga: any) {
    const attrs = manga.attributes;
    const titleObj = attrs.title || {};
    const title =
        titleObj.en || titleObj.fr || titleObj['ja-ro'] || Object.values(titleObj)[0] || 'Unknown Title';
    const descObj = attrs.description || {};
    const resume = descObj.en || descObj.fr || Object.values(descObj)[0] || 'No resume found';
    const authorRel = manga.relationships.find((r: any) => r.type === 'author');
    const author = authorRel?.attributes?.name || 'Unknown Author';
    const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
    const defaultCoverFileName = coverRel?.attributes?.fileName;

    const tags = (attrs.tags || [])
        .filter((tag: any) => tag.attributes.group === 'genre' || tag.attributes.group === 'theme')
        .map((tag: any) => tag.attributes.name.en || tag.attributes.name.fr);

    return {
        title,
        resume: cleanResume(resume),
        author,
        defaultCoverFileName,
        tags,
        type: attrs.publicationDemographic || manga.type || 'Manga',
        status: attrs.status || 'Unknown',
    };
}

export async function getCompleteVolumeData(universe: string, tome: number): Promise<Manga | null> {
    const cacheKey = generateCacheKey(universe, tome);
    const cached = await getCache<Manga>(cacheKey);

    if (cached.found && cached.data) {
        return cached.data;
    }

    const manga = await fetchMangaByTitle(universe);
    if (!manga) return null;

    const mangaId = manga.id;
    const targetVolume = tome.toString();
    const meta = extractMangaMetadata(manga);

    const [volumeCoverUrl, chapters] = await Promise.all([
        fetchVolumeCoverUrl(mangaId, targetVolume, meta.defaultCoverFileName),
        fetchVolumeChapters(mangaId, targetVolume),
    ]);

    const result: Manga = {
        mangaId,
        title: meta.title,
        type: meta.type,
        status: meta.status,
        resume: meta.resume,
        author: meta.author,
        tags: meta.tags,
        volumeCoverUrl,
        chapters,
    };

    await setCache(cacheKey, result);
    return result;
}