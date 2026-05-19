import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import { useCreateWorkflow } from "../hooks/useCreateWorkflow";
import { useWorkflows } from "../hooks/useWorkflows";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function WorkflowsList() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useWorkflows();
  const createWorkflow = useCreateWorkflow();

  function handleNew() {
    createWorkflow.mutate(
      { name: "Untitled workflow" },
      { onSuccess: (wf) => navigate(`/workflows/${wf.id}`) },
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">FlowForge</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">
            {auth.user?.profile.email}
          </span>
          <button
            onClick={handleNew}
            disabled={createWorkflow.isPending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {createWorkflow.isPending ? "Creating…" : "New workflow"}
          </button>
          <button
            onClick={() => auth.signoutRedirect()}
            className="rounded-md border border-gray-700 px-3 py-2 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        <h2 className="mb-6 text-2xl font-bold">Workflows</h2>

        {isLoading && <p className="text-gray-400">Loading…</p>}
        {isError && <p className="text-red-400">Failed to load workflows.</p>}

        {data && data.results.length === 0 && (
          <p className="text-gray-500">No workflows yet. Create your first one.</p>
        )}

        {data && data.results.length > 0 && (
          <ul className="divide-y divide-gray-800 rounded-lg border border-gray-800">
            {data.results.map((wf) => (
              <li
                key={wf.id}
                onClick={() => navigate(`/workflows/${wf.id}`)}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-900 cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium">{wf.name}</p>
                  {wf.description && (
                    <p className="mt-0.5 text-sm text-gray-400">{wf.description}</p>
                  )}
                </div>
                <span className="text-sm text-gray-500">{formatDate(wf.updated_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
