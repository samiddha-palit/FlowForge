import { HardDrive } from "lucide-react";
import { Handle, Position } from "reactflow";

interface Props {
  data: { config: { path?: string } };
  selected: boolean;
}

export default function SinkNode({ data, selected }: Props) {
  return (
    <div
      className={`rounded-lg overflow-hidden shadow-lg border w-48 ${
        selected ? "border-emerald-400" : "border-gray-700"
      } bg-gray-900`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-emerald-400 !border-emerald-600"
      />
      <div className="bg-emerald-600 px-3 py-2 flex items-center gap-2">
        <HardDrive size={13} className="text-white" />
        <span className="text-white text-xs font-semibold uppercase tracking-wide">
          Sink
        </span>
      </div>
      <div className="px-3 py-2 text-gray-400 text-xs truncate">
        {data.config?.path || "No path set"}
      </div>
    </div>
  );
}
