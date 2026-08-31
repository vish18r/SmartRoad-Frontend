export interface RoadResponse {
  id: string;
  projectId: string;
  name: string;
  lengthM: number;
  widthM: number;
  thicknessMm: number;
  startChainage?: string;
  endChainage?: string;
  completedLengthM: number;
  remainingLengthM: number;
  completionPercentage: number;
}

export interface RoadCreateRequest {
  name: string;
  lengthM: number;
  widthM: number;
  thicknessMm: number;
  startChainage?: string;
  endChainage?: string;
}

export interface RoadUpdateRequest {
  name?: string;
  lengthM?: number;
  widthM?: number;
  thicknessMm?: number;
  startChainage?: string;
  endChainage?: string;
}

export interface RoadSectionResponse {
  id: string;
  roadId: string;
  startChainage?: string;
  endChainage?: string;
  lengthM: number;
  completedLengthM: number;
  remainingLengthM: number;
  completionPercentage: number;
}

export interface RoadSectionCreateRequest {
  startChainage?: string;
  endChainage?: string;
  lengthM: number;
}

export interface RoadSectionUpdateRequest {
  startChainage?: string;
  endChainage?: string;
  lengthM?: number;
}

export type Road = RoadResponse;
export type RoadRequest = RoadCreateRequest | RoadUpdateRequest;
export type RoadSection = RoadSectionResponse;
export type RoadSectionRequest = RoadSectionCreateRequest | RoadSectionUpdateRequest;
