import type { PhotoItem, PhotoPreview } from "./photo";

export interface ResearchRaw {
    name: string;
    description?: string;
    photo_ids: number[];
}

export interface ResearchPreview {
    name: string;
    description: string | null;
    id: number;
    created_at: string;
    research_photos: PhotoPreview[];
}

export interface ResearchItem {
    name: string;
    description: string | null;
    id: number;
    created_at: string;
    photos: PhotoItem[];
}

export interface ResearchDetailsItem extends ResearchItem {
    average_statistics: object | null;
}
