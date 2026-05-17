import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { PaginatedResponse, Workflow } from "../types/workflow";

export function useWorkflows() {
  return useQuery({
    queryKey: ["workflows"],
    queryFn: () => apiFetch<PaginatedResponse<Workflow>>("/workflows/"),
  });
}
