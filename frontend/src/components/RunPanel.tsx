import { useState } from "react";
import { Play, X } from "lucide-react";

import { useCreateRun } from "../hooks/useCreateRun";
import { useRunLogs } from "../hooks/useRunLogs";
import { useRuns } from "../hooks/useRuns";
import type { RunStatus } from "../types/workflow";

const STATUS_STYLES: Record<RunStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  RUNNING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SUCCEEDED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
};

function StatusBadge({ status }: { status: RunStatus }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function LogsModal({ runId, onClose }: { runId: string; onClose: () => void }) {
  const { data, isLoading } = useRunLogs(runId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-[780px] max-h-[75vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 shrink-0">
          <span className="text-sm font-medium text-white">Driver logs</span>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap flex-1">
          {isLoading ? (
            <span className="text-gray-500">Fetching logs…</span>
          ) : (
            data?.logs || "No logs available yet."
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface Props {
  workflowId: string;
}

export default function RunPanel({ workflowId }: Props) {
  const [logsRunId, setLogsRunId] = useState<string | null>(null);
  const { mutate: createRun, isPending: starting } = useCreateRun(workflowId);
  const { data: runs } = useRuns(workflowId);

  return (
    <>
      <div className="border-t border-gray-800 bg-gray-950 shrink-0">
        <div className="px-6 py-2 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => createRun()}
            disabled={starting}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
          >
            <Play size={12} />
            {starting ? "Submitting…" : "Run pipeline"}
          </button>

          {runs && runs.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto py-0.5">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center gap-2 shrink-0 text-xs text-gray-500"
                >
                  <StatusBadge status={run.status} />
                  <span>{formatTime(run.started_at)}</span>
                  <button
                    onClick={() => setLogsRunId(run.id)}
                    className="text-gray-500 hover:text-gray-300 underline transition-colors"
                  >
                    logs
                  </button>
                </div>
              ))}
            </div>
          )}

          {(!runs || runs.length === 0) && (
            <span className="text-xs text-gray-600">No runs yet.</span>
          )}
        </div>
      </div>

      {logsRunId && (
        <LogsModal runId={logsRunId} onClose={() => setLogsRunId(null)} />
      )}
    </>
  );
}
