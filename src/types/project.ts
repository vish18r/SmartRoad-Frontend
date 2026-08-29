export interface ProjectRecord {
  readonly id: string;
  readonly attributes: Readonly<Record<string, unknown>>;
}

export type Project = ProjectRecord;
export type ProjectRequest = never;
export type ProjectResponse = ProjectRecord;
export type ProjectSummary = ProjectRecord;
