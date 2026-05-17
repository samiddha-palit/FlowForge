import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "../api/client";
import type { Workflow } from "../types/workflow";

interface CreateWorkflowPayload {
  name: string;
  description?: string;
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description = "" }: CreateWorkflowPayload) =>
      apiFetch<Workflow>("/workflows/", {
        method: "POST",
        body: JSON.stringify({ name, description, spec_json: { nodes: [], edges: [] } }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}
