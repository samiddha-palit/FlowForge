import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { Run } from "../types/workflow";

export function useRuns(workflowId: string) {
  return useQuery({
    queryKey: ["runs", workflowId],
    queryFn: () => apiFetch<Run[]>(`/workflows/${workflowId}/runs/`),
    refetchInterval: 8_000,
  });
}
