import type { PhotoStatistics, ProcessPhotoType } from "./photo";
import type { AverageStatistics } from "./research";

export type MapArea = MapMultiArea | MapSimpleArea;

interface MapAreaBase {
    area_id: number;
    area_name: string;
}

interface MapMultiArea extends MapAreaBase {
    coordinates: [number, number][][];
    type: "MultiPolygon";
}

interface MapSimpleArea extends MapAreaBase {
    coordinates: [number, number][];
    type: "Polygon";
}

export interface MapPoint {
    photo_id: number;
    latitude: number;
    longitude: number;
    area_number: number;
    status: ProcessPhotoType;
    statistics: PhotoStatistics | null;
}

export interface MapAreaStatistics {
    area_id: number;
    average_statistics: AverageStatistics;
    photo_ids: number[];
}
