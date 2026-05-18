import type { Edge, Node } from "reactflow";

import type { DagSpec, NodeType } from "../types/workflow";

export function hasCycle(nodes: Node[], edges: Edge[]): boolean {
  const adj: Record<string, string[]> = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    if (adj[e.source] !== undefined) adj[e.source].push(e.target);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(id: string): boolean {
    if (inStack.has(id)) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    inStack.add(id);
    for (const neighbor of adj[id] ?? []) {
      if (dfs(neighbor)) return true;
    }
    inStack.delete(id);
    return false;
  }

  for (const n of nodes) {
    if (dfs(n.id)) return true;
  }
  return false;
}

export function specToFlow(spec: DagSpec | Record<string, unknown>): {
  nodes: Node[];
  edges: Edge[];
} {
  const dagSpec = spec as DagSpec;
  if (!dagSpec?.nodes || !Array.isArray(dagSpec.nodes)) {
    return { nodes: [], edges: [] };
  }
  const nodes: Node[] = dagSpec.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position ?? { x: 100, y: 100 },
    data: { config: n.config ?? {} },
  }));
  const edges: Edge[] = (dagSpec.edges ?? []).map((e) => ({
    id: `${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    type: "smoothstep",
  }));
  return { nodes, edges };
}

export function flowToSpec(nodes: Node[], edges: Edge[]): DagSpec {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type as NodeType,
      config: n.data?.config ?? {},
      position: n.position,
    })),
    edges: edges.map((e) => ({ from: e.source, to: e.target })),
  };
}
