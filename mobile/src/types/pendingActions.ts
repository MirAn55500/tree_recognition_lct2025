import { ResearchRaw } from "./research";

export type PendingActionType = "CREATE_RESEARCH_WITH_PHOTOS";

export interface ResearchPhoto {
    file: string;
    latitude?: number;
    longitude?: number;
}

export interface PendingResearchData {
    researchData: ResearchRaw;
    photos: ResearchPhoto[];
}

export interface PendingAction {
    id: string;
    type: PendingActionType;
    payload: PendingResearchData;
    timestamp: string;
    retryCount: number;
}
