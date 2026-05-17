export interface Workflow {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  spec_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type RunStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";

export interface Run {
  id: string;
  workflow_version: number;
  status: RunStatus;
  started_at: string | null;
  finished_at: string | null;
  k8s_job_name: string;
  error: string;
  created_at: string;
}
