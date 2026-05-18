export type NodeType = "source" | "transform" | "sink";

export interface SourceConfig {
  path: string;
}

export interface TransformConfig {
  sql: string;
}

export interface SinkConfig {
  path: string;
}

export type NodeConfig = SourceConfig | TransformConfig | SinkConfig;

export interface DagNode {
  id: string;
  type: NodeType;
  config: NodeConfig;
  position: { x: number; y: number };
}

export interface DagEdge {
  from: string;
  to: string;
}

export interface DagSpec {
  nodes: DagNode[];
  edges: DagEdge[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  spec_json: DagSpec | Record<string, unknown>;
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
