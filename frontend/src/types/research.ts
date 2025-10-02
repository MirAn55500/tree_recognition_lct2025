import type { ClassNameType, PhotoItem } from "./photo";

export interface ResearchRaw {
    name: string;
    description?: string;
    photo_ids: number[];
}

export interface ResearchItem {
    name: string;
    description: string;
    id: number;
    created_at: string;
    photos: PhotoItem[];
}

export interface ResearchDetailsItem extends ResearchItem {
    average_statistics: AverageStatistics | null;
}

export interface AverageStatistics {
    bbox: null;
    class_name: ClassNameType;
    cracks: number;
    crown_damage: number;
    diseases: string;
    dry_branches_percentage: number;
    fruiting_bodies: number;
    hollows: number;
    species_probabilities: string;
    stem_damage: number;
}
