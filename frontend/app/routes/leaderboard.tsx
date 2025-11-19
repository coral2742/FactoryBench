import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as React from "react";

async function fetchRuns(apiBase: string) {
  try {
    const res = await fetch(`${apiBase}/runs`);
    if (!res.ok) return { items: [], count: 0 };
    return await res.json();
  } catch {
    return { items: [], count: 0 };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const apiBase = process.env.API_BASE || "http://127.0.0.1:5173";
  const data = await fetchRuns(apiBase);
  return json({ items: data.items || [] });
}

export default function Leaderboard() {
  const { items } = useLoaderData<typeof loader>();
  const [creating, setCreating] = React.useState(false);

  async function createRun() {
    setCreating(true);
    try {
      const apiBase = typeof window !== "undefined" ? "http://127.0.0.1:5173" : "";
      const res = await fetch(`${apiBase}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "telemetry_literacy", model: "mock", limit: 5 })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to create run");
      }
    } catch (err) {
      alert("Error creating run: " + err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Leaderboard</h2>
        <button className="btn primary" onClick={createRun} disabled={creating}>
          {creating ? "Creating..." : "+ Create Mock Run"}
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Run</th>
            <th>Stage</th>
            <th>Model</th>
            <th>OK Rate</th>
            <th>Mean Abs Err (mean)</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={5} className="muted">No runs yet. Create a run via API.</td></tr>
          )}
          {items.map((r: any) => (
            <tr key={r.run_id}>
              <td><a href={`/runs/${r.run_id}`}>{r.run_id}</a></td>
              <td>{r.stage}</td>
              <td>{r.model}</td>
              <td>{((r.aggregate?.ok_rate ?? 0) * 100).toFixed(1)}%</td>
              <td>{(r.aggregate?.mean_abs_err_mean ?? r.aggregate?.["mean_abs_err_mean"]) ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
