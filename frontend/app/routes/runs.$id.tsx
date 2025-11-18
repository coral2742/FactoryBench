import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

async function fetchRun(apiBase: string, id: string) {
  try {
    const res = await fetch(`${apiBase}/runs/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const apiBase = process.env.API_BASE || "http://127.0.0.1:5173";
  const id = params.id as string;
  const data = await fetchRun(apiBase, id);
  return json({ run: data, id });
}

export default function RunDetail() {
  const { run, id } = useLoaderData<typeof loader>();
  if (!run) return <div className="card">Run not found: {id}</div>;
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Run {run.run_id}</h2>
      <p className="muted">Stage: {run.stage} • Model: {run.model}</p>
      <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
        {JSON.stringify(run.aggregate, null, 2)}
      </pre>
    </div>
  );
}
