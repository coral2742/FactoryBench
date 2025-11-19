import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as React from "react";

async function fetchRuns(apiBase: string) {
  try {
    const res = await fetch(`${apiBase}/runs`);
    if (!res.ok) return { items: [] };
    return await res.json();
  } catch {
    return { items: [] };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const apiBase = process.env.API_BASE || "http://127.0.0.1:5173";
  const data = await fetchRuns(apiBase);
  return json({ items: data.items || [] });
}

export default function Analysis() {
  const { items } = useLoaderData<typeof loader>();
  
  // Compute aggregate metrics per stage
  const byStage = items.reduce((acc: any, r: any) => {
    const stage = r.stage || "unknown";
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(r);
    return acc;
  }, {});

  const tlRuns = byStage.telemetry_literacy || [];
  const rcaRuns = byStage.root_cause_analysis || [];
  const grRuns = byStage.guided_remediation || [];

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Analysis</h2>
        <p className="muted">Track model development progress across all stages.</p>
        
        {/* WandB Integration */}
        <div style={{ marginTop: 20, padding: 16, border: "1px solid var(--fg-border)", borderRadius: 8 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>WandB Project</h3>
          <p className="muted" style={{ margin: "0 0 12px 0" }}>
            View detailed experiment tracking and hyperparameter sweeps in Weights & Biases.
          </p>
          <a 
            href="https://wandb.ai/forgis/factorybench" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn"
            style={{ display: "inline-block" }}
          >
            Open WandB Dashboard →
          </a>
          {/* Optional: embed iframe when WandB project is live
          <iframe 
            src="https://wandb.ai/forgis/factorybench/reports/..." 
            style={{ width: "100%", height: 400, border: "1px solid var(--fg-border)", borderRadius: 8, marginTop: 12 }}
          />
          */}
        </div>
      </div>

      {/* Stage 1: Telemetry Literacy */}
      <StageSection
        title="Stage 1: Telemetry Literacy"
        runs={tlRuns}
        charts={[
          { title: "Error Distribution (Mean/Min/Max)", type: "error_dist" },
          { title: "Model Convergence", type: "convergence" },
          { title: "OK Rate Over Time", type: "ok_rate" }
        ]}
      />

      {/* Stage 2: Root Cause Analysis */}
      <StageSection
        title="Stage 2: Root Cause Analysis (Planned)"
        runs={rcaRuns}
        charts={[
          { title: "Retrieval Precision@K", type: "retrieval" },
          { title: "Step Ordering Accuracy (Kendall τ)", type: "ordering" },
          { title: "Fault Classification F1", type: "classification" }
        ]}
      />

      {/* Stage 3: Guided Remediation */}
      <StageSection
        title="Stage 3: Guided Remediation (Planned)"
        runs={grRuns}
        charts={[
          { title: "Safety Compliance Score", type: "safety" },
          { title: "Instruction Quality (BLEURT)", type: "quality" },
          { title: "Coverage vs Efficiency", type: "coverage_efficiency" }
        ]}
      />
    </div>
  );
}

function StageSection({ title, runs, charts }: { title: string; runs: any[]; charts: { title: string; type: string }[] }) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: "0 0 4px 0" }}>{title}</h3>
          <p className="muted" style={{ margin: 0 }}>{runs.length} runs</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn"
          style={{ fontSize: 14, padding: "4px 12px" }}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>
      
      {isExpanded && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {charts.map(chart => (
            <ChartPlaceholder key={chart.type} title={chart.title} type={chart.type} runs={runs} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChartPlaceholder({ title, type, runs }: { title: string; type: string; runs: any[] }) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `factorybench-${type}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render minimal SVG chart using brand colors
  // For telemetry_literacy: aggregate mean_abs_err_mean from runs
  let chartContent = null;

  if (type === "error_dist" && runs.length > 0) {
    const errors = runs.map((r: any) => r.aggregate?.mean_abs_err_mean || 0);
    const max = Math.max(...errors, 1);
    chartContent = (
      <svg ref={svgRef} width="100%" height="120" style={{ background: "#0f1d25", borderRadius: 6 }}>
        {errors.map((err: number, i: number) => {
          const barHeight = (err / max) * 100;
          const x = (i / errors.length) * 100;
          const width = 100 / errors.length - 2;
          return (
            <rect
              key={i}
              x={`${x}%`}
              y={`${100 - barHeight}%`}
              width={`${width}%`}
              height={`${barHeight}%`}
              fill="var(--fg-fire)"
              opacity={0.8}
            />
          );
        })}
      </svg>
    );
  } else if (type === "convergence" && runs.length > 0) {
    const sorted = [...runs].sort((a: any, b: any) => 
      new Date(a.started_at || 0).getTime() - new Date(b.started_at || 0).getTime()
    );
    const errors = sorted.map((r: any) => r.aggregate?.mean_abs_err_mean || 0);
    const max = Math.max(...errors, 1);
    const points = errors.map((err: number, i: number) => {
      const x = (i / (errors.length - 1)) * 100;
      const y = 100 - (err / max) * 80;
      return `${x},${y}`;
    }).join(" ");
    
    chartContent = (
      <svg ref={svgRef} width="100%" height="120" style={{ background: "#0f1d25", borderRadius: 6 }}>
        <polyline
          points={points}
          fill="none"
          stroke="var(--fg-tiger)"
          strokeWidth="2"
        />
        {errors.map((err: number, i: number) => {
          const x = (i / (errors.length - 1)) * 100;
          const y = 100 - (err / max) * 80;
          return <circle key={i} cx={`${x}%`} cy={y} r="3" fill="var(--fg-fire)" />;
        })}
      </svg>
    );
  } else if (type === "ok_rate" && runs.length > 0) {
    const sorted = [...runs].sort((a: any, b: any) => 
      new Date(a.started_at || 0).getTime() - new Date(b.started_at || 0).getTime()
    );
    const okRates = sorted.map((r: any) => (r.aggregate?.ok_rate || 0) * 100);
    const points = okRates.map((rate: number, i: number) => {
      const x = (i / (okRates.length - 1)) * 100;
      const y = 100 - rate * 0.8;
      return `${x},${y}`;
    }).join(" ");
    
    chartContent = (
      <svg ref={svgRef} width="100%" height="120" style={{ background: "#0f1d25", borderRadius: 6 }}>
        <polyline
          points={points}
          fill="none"
          stroke="var(--fg-flicker)"
          strokeWidth="2"
        />
        {okRates.map((rate: number, i: number) => {
          const x = (i / (okRates.length - 1)) * 100;
          const y = 100 - rate * 0.8;
          return <circle key={i} cx={`${x}%`} cy={y} r="3" fill="var(--fg-tiger)" />;
        })}
        <text x="10" y="20" fill="var(--fg-platinum)" fontSize="12">{okRates[okRates.length - 1]?.toFixed(1)}%</text>
      </svg>
    );
  } else {
    chartContent = (
      <div style={{ 
        background: "#0f1d25", 
        height: 120, 
        borderRadius: 6, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: "var(--fg-steel)"
      }}>
        {runs.length === 0 ? "No data" : "Chart TBD"}
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid var(--fg-border)", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 14 }}>{title}</h4>
        {svgRef.current && (
          <button
            onClick={downloadSVG}
            className="btn"
            style={{ fontSize: 12, padding: "2px 8px" }}
            title="Download SVG"
          >
            ↓ SVG
          </button>
        )}
      </div>
      {chartContent}
    </div>
  );
}
