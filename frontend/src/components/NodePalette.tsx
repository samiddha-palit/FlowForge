import { Code2, Database, HardDrive } from "lucide-react";

const PALETTE = [
  { type: "source", label: "Source", Icon: Database, color: "bg-blue-600" },
  { type: "transform", label: "Transform", Icon: Code2, color: "bg-purple-600" },
  { type: "sink", label: "Sink", Icon: HardDrive, color: "bg-emerald-600" },
] as const;

export default function NodePalette() {
  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("application/flowforge-node", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-44 shrink-0 border-r border-gray-800 bg-gray-950 p-4 flex flex-col gap-3">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
        Nodes
      </p>
      {PALETTE.map(({ type, label, Icon, color }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 cursor-grab hover:border-gray-500 active:cursor-grabbing transition-colors select-none"
        >
          <div className={`${color} rounded p-1`}>
            <Icon size={12} className="text-white" />
          </div>
          <span className="text-gray-300 text-sm">{label}</span>
        </div>
      ))}
      <p className="text-xs text-gray-600 mt-1">Drag onto canvas</p>
    </aside>
  );
}
