import { useCallback, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  MiniMap,
  Node,
  ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

import ConfigPanel from "./ConfigPanel";
import NodePalette from "./NodePalette";
import SourceNode from "./nodes/SourceNode";
import SinkNode from "./nodes/SinkNode";
import TransformNode from "./nodes/TransformNode";
import { useUpdateWorkflow } from "../hooks/useUpdateWorkflow";
import type { Workflow } from "../types/workflow";
import { flowToSpec, hasCycle, specToFlow } from "../utils/dagUtils";

const NODE_TYPES = {
  source: SourceNode,
  transform: TransformNode,
  sink: SinkNode,
};

const DEFAULT_CONFIG: Record<string, Record<string, unknown>> = {
  source: { path: "" },
  transform: { sql: "" },
  sink: { path: "" },
};

interface Props {
  workflow: Workflow;
}

export default function DagCanvas({ workflow }: Props) {
  const initial = useMemo(() => specToFlow(workflow.spec_json), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { mutate: saveWorkflow, isPending: saving } = useUpdateWorkflow(
    workflow.id,
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return;
      const candidate = [
        ...edges,
        {
          id: `${connection.source}-${connection.target}`,
          source: connection.source!,
          target: connection.target!,
        },
      ];
      if (hasCycle(nodes, candidate as any)) {
        alert("Cannot connect: would introduce a cycle.");
        return;
      }
      setEdges((eds) =>
        addEdge({ ...connection, type: "smoothstep" }, eds),
      );
    },
    [nodes, edges, setEdges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/flowforge-node");
      if (!type || !rfInstance || !wrapperRef.current) return;
      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      const id = `${type}-${Date.now()}`;
      setNodes((ns) => [
        ...ns,
        {
          id,
          type,
          position,
          data: { config: { ...DEFAULT_CONFIG[type] } },
        },
      ]);
    },
    [rfInstance, setNodes],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onConfigChange = useCallback(
    (nodeId: string, config: Record<string, unknown>) => {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, config } } : n,
        ),
      );
      setSelectedNode((prev) =>
        prev?.id === nodeId
          ? { ...prev, data: { ...prev.data, config } }
          : prev,
      );
    },
    [setNodes],
  );

  const onSave = () => {
    saveWorkflow({ spec_json: flowToSpec(nodes, edges) });
  };

  return (
    <div className="flex flex-1 min-h-0">
      <NodePalette />

      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-end px-4 py-2 border-b border-gray-800 bg-gray-950 shrink-0">
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div
          ref={wrapperRef}
          className="flex-1"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={NODE_TYPES}
            fitView
            className="bg-gray-950"
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="#374151"
              gap={20}
              size={1}
            />
            <Controls className="[&>button]:!bg-gray-900 [&>button]:!border-gray-700 [&>button]:!text-gray-400" />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === "source") return "#2563eb";
                if (node.type === "transform") return "#7c3aed";
                return "#059669";
              }}
              className="!bg-gray-900 !border-gray-700"
            />
          </ReactFlow>
        </div>
      </div>

      <ConfigPanel
        node={selectedNode}
        onChange={onConfigChange}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
