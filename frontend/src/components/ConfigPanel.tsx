import type { Node } from "reactflow";

interface Props {
  node: Node | null;
  onChange: (nodeId: string, config: Record<string, unknown>) => void;
  onClose: () => void;
}

export default function ConfigPanel({ node, onChange, onClose }: Props) {
  if (!node) return null;

  const config: Record<string, unknown> = node.data?.config ?? {};

  const set = (key: string, value: string) =>
    onChange(node.id, { ...config, [key]: value });

  return (
    <aside className="w-68 shrink-0 border-l border-gray-800 bg-gray-950 p-5 flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm capitalize">
          {node.type} node
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>

      <p className="text-gray-600 text-xs font-mono">{node.id}</p>

      {(node.type === "source" || node.type === "sink") && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-400">File path</span>
          <input
            type="text"
            value={(config.path as string) ?? ""}
            onChange={(e) => set("path", e.target.value)}
            placeholder="s3://flowforge-data/..."
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500 placeholder-gray-600 transition-colors"
          />
        </label>
      )}

      {node.type === "transform" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-400">SQL query</span>
          <textarea
            value={(config.sql as string) ?? ""}
            onChange={(e) => set("sql", e.target.value)}
            placeholder={"SELECT *\nFROM input"}
            rows={8}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-gray-500 placeholder-gray-600 resize-none transition-colors"
          />
        </label>
      )}
    </aside>
  );
}
