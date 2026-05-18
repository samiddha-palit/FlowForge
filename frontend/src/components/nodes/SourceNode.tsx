import { Database } from "lucide-react";
import { Handle, Position } from "reactflow";

interface Props {
  data: { config: { path?: string } };
  selected: boolean;
}

export default function SourceNode({ data, selected }: Props) {
  return (
    <div
      className={`rounded-lg overflow-hidden shadow-lg border w-48 ${
        selected ? "border-blue-400" : "border-gray-700"
      } bg-gray-900`}
    >
      <div className="bg-blue-600 px-3 py-2 flex items-center gap-2">
        <Database size={13} className="text-white" />
        <span className="text-white text-xs font-semibold uppercase tracking-wide">
          Source
        </span>
      </div>
      <div className="px-3 py-2 text-gray-400 text-xs truncate">
        {data.config?.path || "No path set"}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-400 !border-blue-600"
      />
    </div>
  );
}
