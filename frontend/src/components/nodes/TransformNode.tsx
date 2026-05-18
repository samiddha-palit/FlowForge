import { Code2 } from "lucide-react";
import { Handle, Position } from "reactflow";

interface Props {
  data: { config: { sql?: string } };
  selected: boolean;
}

export default function TransformNode({ data, selected }: Props) {
  return (
    <div
      className={`rounded-lg overflow-hidden shadow-lg border w-48 ${
        selected ? "border-purple-400" : "border-gray-700"
      } bg-gray-900`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-400 !border-purple-600"
      />
      <div className="bg-purple-600 px-3 py-2 flex items-center gap-2">
        <Code2 size={13} className="text-white" />
        <span className="text-white text-xs font-semibold uppercase tracking-wide">
          Transform
        </span>
      </div>
      <div className="px-3 py-2 text-gray-400 text-xs truncate font-mono">
        {data.config?.sql || "No SQL set"}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-400 !border-purple-600"
      />
    </div>
  );
}
