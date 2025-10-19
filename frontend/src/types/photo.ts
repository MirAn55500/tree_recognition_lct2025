import type { Diases, Species } from "./dataset";

export type ProcessPhotoType = "uploaded" | "processing" | "processed" | "annotated";
export type ClassNameType = "tree" | "shrub" | "tree shrub";

export const classNames: ClassNameType[] = ["tree", "shrub", "tree shrub"];

export const classNameToString: Record<ClassNameType, string> = {
    tree: "Дерево",
    shrub: "Кустарник",
    "tree shrub": "Дерево-кустарник",
};

export interface PhotoItemShort {
    id: number;
    filename: string;
    status: ProcessPhotoType;
}

export interface PhotoItem extends PhotoItemShort {
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    statistics: PhotoStatistics | null;
}

export interface PhotoUploadResponse {
    photo_id: number;
    message: string;
}

export interface PhotoUploadRequest {
    file: File;
    latitude?: number;
    longitude?: number;
}

export interface ProcessPhotoResponse {
    message: string;
}

export interface PhotoStatusResponse {
    status: ProcessPhotoType;
    statistics: PhotoStatistics | null;
}

export interface PhotoAnnotation {
    bbox: number[];
    class_name: ClassNameType;
    species: Species[];
    species_confidence: number[];
    hollows: number;
    cracks: number;
    stem_damage: number;
    crown_damage: number;
    fruiting_bodies: number;
    diseases: Diases[];
    dry_branches_percentage: number;
}

export interface PhotoStatistics {
    filename: string;
    results: PhotoAnnotation[];
}

export interface PhotoIdsResponse {
    photo_ids: PhotoItemShort[];
    total_count: number;
}
