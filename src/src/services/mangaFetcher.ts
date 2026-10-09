import axios from 'axios';
import { cleanResume } from '@/utils/cleanResume';
import { getCache, setCache } from '@/services/cacheService';
import { formatToStub } from '@/utils/utils';

const MANGADEX_API = 'https://api.mangadex.org';
const COVER_BASE_URL = 'https://uploads.mangadex.org/covers';
const CACHE_PREFIX = '@manga_fetcher_cache_v2_';

export interface Manga {
    mangaId: string;
    title: string;
    type: string;
    status: string;
    resume: string;
    author: string;
    tags: string[];
    volumeCoverUrl: string | null;
    chapters: Array<{ chapterId: string; title: string; chapter: number }> | null;
}

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

const VARIANT_REGEX = /(colou?red|anthology|fanbook|spin ?off|4 ?koma|artbook|official guide)/;

function scoreTitle(query: string, candidate: string): number {
    if (!candidate) return 0;
    if (candidate === query) return 100;

    const q = new Set(query.split(' '));
    const c = new Set(candidate.split(' '));
    const inter = [...q].filter((t) => c.has(t)).length;
    const union = new Set([...q, ...c]).size;

    let score = (inter / union) * 80;
    if (candidate.startsWith(query + ' ')) score += 10;
    if (VARIANT_REGEX.test(candidate) && !VARIANT_REGEX.test(query)) score -= 30;
    return score;
}

function getAllTitles(attrs: any): string[] {
    const main = Object.values(attrs.title || {}) as string[];
    const alts = (attrs.altTitles || []).flatMap((o: any) => Object.values(o) as string[]);
    return [...main, ...alts];
}

function findMangaBestResult(title: string, mangas: any[]): any | null {
    const query = normalize(title);

    const scored = mangas.map((manga, index) => {
        const attrs = manga.attributes;

        if (
            ['porn', 'erotica'].includes(attrs.contentRating) ||
            attrs.publicationDemographic === 'doujinshi'
        ) {
            return { manga, score: -Infinity };
        }

        const best = Math.max(
            ...getAllTitles(attrs).map((t) => scoreTitle(query, normalize(t))),
            0
        );

        return { manga, score: best - index * 0.5 };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored[0];
    return top && top.score > -Infinity ? top.manga : null;
}

async function fetchMangaByTitle(title: string): Promise<any | null> {
    try {
        const res = await axios.get(`${MANGADEX_API}/manga`, {
            params: {
                title,
                'includes[]': ['author', 'cover_art'],
                'order[relevance]': 'desc',
                'contentRating[]': ['safe', 'suggestive'],
                limit: 20,
            },
        });

        const mangas = res.data?.data;
        if (!mangas || mangas.length === 0) return null;

        return findMangaBestResult(title, mangas);
    } catch (error) {
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
                limit: 100,
            },
        });
        const covers = res.data?.data;
        if (covers && Array.isArray(covers)) {
            const exactCover = covers.find((c: any) => c.attributes?.volume === volume);

            if (exactCover?.attributes?.fileName) {
                return `${COVER_BASE_URL}/${mangaId}/${exactCover.attributes.fileName}`;
            }
        }
    } catch (error) {
        console.error(error)
    }

    return defaultFileName ? `${COVER_BASE_URL}/${mangaId}/${defaultFileName}` : null;
}

async function fetchVolumeChapters(mangaId: string, volume: string) {
    try {
        const res = await axios.get(`${MANGADEX_API}/manga/${mangaId}/feed`, {
            params: {
                limit: 500,
                'translatedLanguage[]': ['en'],
                'order[chapter]': 'asc',
            },
        });

        const allChapters = res.data?.data;
        if (!allChapters || !Array.isArray(allChapters)) return null;

        const volumeChaps = allChapters.filter((c: any) => c.attributes.volume === volume);
        if (volumeChaps.length === 0) return null;

        return volumeChaps.map((c: any) => ({
            chapterId: c.id,
            title: c.attributes.title || `Chapter ${c.attributes.chapter}`,
            chapter: Number(c.attributes.chapter),
        }));
    } catch (error) {
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