import axios, { AxiosResponse } from 'axios';
import { cleanResume } from '@/utils/cleanResume';
import { getCache, setCache } from '@/services/cacheService';
import { formatToStub } from '@/utils/utils';

const MANGADEX_API = 'https://api.mangadex.org';
const COVER_BASE_URL = 'https://uploads.mangadex.org/covers';
const CACHE_PREFIX = '@manga_fetcher_cache_';

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

function findMangaBestResult(title: string, mangas: Array<any>): any {
    const normalizedQuery = title.toLowerCase().trim();
    const scoredMangas = mangas.map((manga: any) => {
        const attrs = manga.attributes;
        const titleObj = attrs.title || {};
        const titlesList = Object.values(titleObj) as string[];

        let score = 0;

        const rating = attrs.contentRating;
        if (rating === 'porn' || rating === 'erotica') return { manga, score: 0 }
        if (attrs.publicationDemographic === 'doujinshi') return { manga, score: 0 }

        for (const t of titlesList) {
            const normTitle = t.toLowerCase().trim();

            if (normTitle === normalizedQuery) {
                score += 100;
            } else if (normTitle.includes(normalizedQuery) || normalizedQuery.includes(normTitle)) {
                score += 50;
            }
        }
        return { manga, score };
    });

    scoredMangas.sort((a: any, b: any) => b.score - a.score);
    return scoredMangas[0]?.manga || mangas[0] || null;
}

async function fetchMangaByTitle(title: string): Promise<any | null> {
    try {
        const res = await axios.get(`${MANGADEX_API}/manga`, {
            params: {
                title: title,
                'includes[]': ['author', 'cover_art'],
                'order[relevance]': 'desc',
                'contentRating[]': ['safe', 'suggestive'],
                limit: 10
            }
        });

        const mangas = res.data?.data;
        if (!mangas || mangas.length === 0) return null;

        return findMangaBestResult(title, mangas) || null
    } catch (error) {
        return null;
    }
}

async function fetchVolumeCoverUrl(mangaId: string, volume: string, defaultFileName?: string): Promise<string | null> {
    try {
        const res = await axios.get(`${MANGADEX_API}/cover`, {
            params: {
                'manga[]': [mangaId],
                limit: 100
            }
        });
        const covers = res.data?.data;
        if (covers && Array.isArray(covers)) {
            const exactCover = covers.find((c: any) => c.attributes?.volume === volume);

            if (exactCover?.attributes?.fileName) {
                return `${COVER_BASE_URL}/${mangaId}/${exactCover.attributes.fileName}`;
            }
        }
    } catch (error) {
    }

    return defaultFileName ? `${COVER_BASE_URL}/${mangaId}/${defaultFileName}` : null;
}

async function fetchVolumeChapters(mangaId: string, volume: string) {
    try {
        const res = await axios.get(`${MANGADEX_API}/manga/${mangaId}/feed`, {
            params: {
                limit: 500,
                'translatedLanguage[]': ['en'],
                'order[chapter]': 'asc'
            }
        });

        const allChapters = res.data?.data;
        if (!allChapters || !Array.isArray(allChapters)) return null;

        const volumeChaps = allChapters.filter((c: any) => c.attributes.volume === volume);
        if (volumeChaps.length === 0) return null;

        return volumeChaps.map((c: any) => ({
            chapterId: c.id,
            title: c.attributes.title || `Chapter ${c.attributes.chapter}`,
            chapter: Number(c.attributes.chapter)
        }));
    } catch (error) {
        return null;
    }
}

function extractMangaMetadata(manga: any) {
    const attrs = manga.attributes;
    const titleObj = attrs.title || {};
    const title = titleObj.en || titleObj.fr || titleObj['ja-ro'] || Object.values(titleObj)[0] || "Unknown Title";
    const descObj = attrs.description || {};
    const resume = descObj.en || descObj.fr || Object.values(descObj)[0] || "No resume found";
    const authorRel = manga.relationships.find((r: any) => r.type === 'author');
    const author = authorRel?.attributes?.name || "Unknown Authour";
    const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
    const defaultCoverFileName = coverRel?.attributes?.fileName;

    const tags = attrs.tags
        .filter((tag: any) => tag.attributes.group === 'genre' || tag.attributes.group === 'theme')
        .map((tag: any) => tag.attributes.name.en || tag.attributes.name.fr);

    return {
        title,
        resume: cleanResume(resume),
        author,
        defaultCoverFileName,
        tags,
        type: attrs.publicationDemographic || manga.type || "Manga",
        status: attrs.status || "Unknown"
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
        mangaId: mangaId,
        title: meta.title,
        type: meta.type,
        status: meta.status,
        resume: meta.resume,
        author: meta.author,
        tags: meta.tags,
        volumeCoverUrl: volumeCoverUrl,
        chapters: chapters
    };

    await setCache(cacheKey, result);
    return result;
}
