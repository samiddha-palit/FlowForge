import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";

export function useRunLogs(runId: string | null) {
  return useQuery({
    queryKey: ["run-logs", runId],
    queryFn: () => apiFetch<{ logs: string }>(`/runs/${runId}/logs/`),
    enabled: !!runId,
    staleTime: 5_000,
  });
}
