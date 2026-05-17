import { useQuery } from "@tanstack/react-query";

async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch("/api/health/");
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold tracking-tight">FlowForge</h1>
      <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-5 py-3 text-sm">
        <span className="text-gray-400">Backend status:</span>
        {isLoading && <span className="text-yellow-400">checking…</span>}
        {isError && <span className="text-red-400">unreachable</span>}
        {data && (
          <>
            <span
              className={`h-2 w-2 rounded-full ${
                data.status === "ok" ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span
              className={data.status === "ok" ? "text-green-400" : "text-red-400"}
            >
              {data.status}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
