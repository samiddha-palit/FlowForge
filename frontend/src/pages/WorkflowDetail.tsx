import { useNavigate, useParams } from "react-router-dom";

import DagCanvas from "../components/DagCanvas";
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
    <div className="h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-8 py-4 flex items-center gap-4 shrink-0">
        <button
          onClick={() => navigate("/workflows")}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Workflows
        </button>
        <h1 className="text-lg font-semibold">{workflow.name}</h1>
        {workflow.description && (
          <span className="text-gray-500 text-sm">{workflow.description}</span>
        )}
      </header>

      <DagCanvas workflow={workflow} />
    </div>
  );
}
