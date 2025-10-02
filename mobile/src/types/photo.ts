export type ProcessPhotoType = "uploaded" | "processing" | "processed";

export interface PhotoPreview {
    id: number;
    photo_id: number;
    order_index: number;
    photo: PhotoItem;
}

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
    file: string;
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
    class_name: string;
    species: string[];
    species_confidence: number[];
    hollows: number;
    cracks: number;
    stem_damage: number;
    crown_damage: number;
    fruiting_bodies: number;
    diseases: string[];
    dry_branches_percentage: number;
}

export interface PhotoStatistics {
    img_path: null;
    results: PhotoAnnotation[];
}

export interface PhotoIdsResponse {
    photo_ids: PhotoItemShort[];
    total_count: number;
}
