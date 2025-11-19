import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return null;
}

export default function Index() {
  return (
    <div className="hero">
      <h1>FactoryBench</h1>
      <p className="muted">Benchmark for industrial troubleshooting. Stage: telemetry_literacy (MVP).</p>
      <div style={{ marginTop: 12 }}>
        <a className="btn primary" href="/leaderboard">View Leaderboard</a>
        <a className="btn" style={{ marginLeft: 8 }} href="/analysis">View Analysis</a>
      </div>
    </div>
  );
}
