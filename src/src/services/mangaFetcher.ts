import { cleanResume } from '@/utils/cleanResume';
import axios from 'axios'; 

export interface MangaVolumeDetails {
    mangaId: string;
    title: string;
    type: string;
    status: string;
    resume: string;
    coverUrl: string | null;
    author?: string;
    chapters?: Array<{ id: string; chapter: string; title?: string | null }>;
}

const MANGADEX_API = 'https://api.mangadex.org';

async function fetchManga(title: string): Promise<any | null> {
    try {
        const res = await axios({
            method: 'GET',
            url: `${MANGADEX_API}/manga`,
            params: {
                title: title,
                'includes[]': ['author', 'cover_art'] 
            }
        });

        if (!res?.data?.data || res.data.data.length === 0) return null;
        return res.data.data[0];
    } catch (error) {
        console.error("Error fetching manga:", error);
        return null;
    }
}

async function fetchCover(mangaId: string, coverId: string): Promise<string | null> {
    try {
        const res = await axios({
            method: 'GET',
            url: `${MANGADEX_API}/cover/${coverId}`
        });
        const fileName = res.data?.data?.attributes?.fileName;
        if (!fileName) return null;
        
        return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
    } catch (error) {
        console.error("Error fetching cover:", error);
        return null;
    }
}

export async function getMangaDetails(
    universe: string,
    tome: number | string
): Promise<MangaVolumeDetails | null> {
    const m = await fetchManga(universe);
    if (!m) return null;

    const titleObj = m.attributes?.title || {};
    const title = titleObj.en || titleObj['ja-ro'] || Object.values(titleObj)[0] || "No title";

    const descObj = m.attributes?.description || {};
    const resume = descObj.en || Object.values(descObj)[0] || "No resume";

    const authorRel = m.relationships?.find((rel: any) => rel.type === 'author');
    const coverRel = m.relationships?.find((rel: any) => rel.type === 'cover_art');

    const authorName = authorRel?.attributes?.name ?? "Unknown Author";

    let coverUrl: string | null = null;
    if (coverRel?.attributes?.fileName) {
        coverUrl = `https://uploads.mangadex.org/covers/${m.id}/${coverRel.attributes.fileName}`;
    } else if (coverRel?.id) {
       
        coverUrl = await fetchCover(m.id, coverRel.id);
    }

    const result: MangaVolumeDetails = {
        mangaId: m.id,
        title: title as string,
        type: m.type ?? "No type",
        status: m.attributes?.status ?? "No status",
        resume: cleanResume(resume as string),
        coverUrl: coverUrl,
        author: authorName,
        chapters: [] 
    };

    return result;
}