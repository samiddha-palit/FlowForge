import { useNavigate, useParams } from "react-router-dom";

import { useWorkflow } from "../hooks/useWorkflow";

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workflow, isLoading, isError } = useWorkflow(id ?? "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-400 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (isError || !workflow) {
    return (
      <div className="min-h-screen bg-gray-950 text-red-400 flex items-center justify-center">
        Workflow not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/workflows")}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Workflows
        </button>
        <h1 className="text-lg font-semibold">{workflow.name}</h1>
      </header>

      <main className="flex flex-col flex-1 px-8 py-8 gap-6">
        {workflow.description && (
          <p className="text-gray-400 text-sm">{workflow.description}</p>
        )}

        {/* DAG canvas placeholder — replaced by ReactFlow in Week 7 */}
        <div className="flex-1 rounded-lg border border-dashed border-gray-700 bg-gray-900 flex items-center justify-center min-h-96">
          <p className="text-gray-600 text-sm">DAG builder — Week 7</p>
        </div>
      </main>
    </div>
  );
}
