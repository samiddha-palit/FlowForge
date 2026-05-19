import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { Run } from "../types/workflow";

export function useCreateRun(workflowId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<Run>(`/workflows/${workflowId}/runs/`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runs", workflowId] });
    },
  });
}
