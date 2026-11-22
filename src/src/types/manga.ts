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
