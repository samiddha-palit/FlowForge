import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { Workflow } from "../types/workflow";

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ["workflows", id],
    queryFn: () => apiFetch<Workflow>(`/workflows/${id}/`),
    enabled: !!id,
  });
}
