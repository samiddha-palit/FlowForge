import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { DagSpec, Workflow } from "../types/workflow";

interface UpdatePayload {
  spec_json: DagSpec;
}

export function useUpdateWorkflow(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePayload) =>
      apiFetch<Workflow>(`/workflows/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow", id] });
    },
  });
}
