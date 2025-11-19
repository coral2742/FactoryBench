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
  const [activeTab, setActiveTab] = React.useState<"stage1" | "stage2" | "stage3">("stage1");
  
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

  const stages = [
    {
      id: "stage1" as const,
      title: "Stage 1: Telemetry Literacy",
      runs: tlRuns,
      charts: [
        { title: "Error Distribution (Mean/Min/Max)", type: "error_distribution" },
        { title: "Model Convergence", type: "convergence" },
        { title: "OK Rate Over Time", type: "ok_rate" },
        { title: "Model Comparison", type: "model_comparison" },
        { title: "Error Breakdown by Metric", type: "error_breakdown" },
        { title: "Performance vs Cost", type: "cost_quality" }
      ]
    },
    {
      id: "stage2" as const,
      title: "Stage 2: Root Cause Analysis",
      runs: rcaRuns,
      charts: [
        { title: "Retrieval Precision@K", type: "retrieval" },
        { title: "Step Ordering Accuracy (Kendall τ)", type: "ordering" },
        { title: "Fault Classification F1", type: "classification" }
      ]
    },
    {
      id: "stage3" as const,
      title: "Stage 3: Guided Remediation",
      runs: grRuns,
      charts: [
        { title: "Safety Compliance Score", type: "safety" },
        { title: "Instruction Quality (BLEURT)", type: "quality" },
        { title: "Coverage vs Efficiency", type: "coverage_efficiency" }
      ]
    }
  ];

  const currentStage = stages.find(s => s.id === activeTab) || stages[0];

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
        </div>
      </div>

      {/* Stage Tabs */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, borderBottom: "2px solid var(--fg-border)", paddingBottom: 8, marginBottom: 24 }}>
          {stages.map(stage => (
            <button
              key={stage.id}
              onClick={() => setActiveTab(stage.id)}
              className="btn"
              style={{
                padding: "8px 16px",
                background: activeTab === stage.id ? "var(--fg-fire)" : "transparent",
                color: activeTab === stage.id ? "var(--fg-white)" : "var(--fg-steel)",
                border: "none",
                borderBottom: activeTab === stage.id ? "2px solid var(--fg-fire)" : "2px solid transparent",
                marginBottom: -2,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeTab === stage.id ? 600 : 400
              }}
            >
              {stage.title}
              <span style={{ marginLeft: 8, opacity: 0.7 }}>({stage.runs.length})</span>
            </button>
          ))}
        </div>

        {/* Active Stage Content */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>
            {currentStage.charts.map(chart => (
              <ChartCard key={chart.type} title={chart.title} type={chart.type} runs={currentStage.runs} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, type, runs }: { title: string; type: string; runs: any[] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const downloadChart = async () => {
    const apiBase = "http://127.0.0.1:5173";
    const url = `${apiBase}/charts/${type}`;
    const timestamp = new Date().toISOString().split('T')[0];
    const link = document.createElement("a");
    link.href = url;
    link.download = `factorybench-${type}-${timestamp}.png`;
    link.click();
  };

  // Use Python-generated charts from API
  const apiBase = "http://127.0.0.1:5173";
  const chartUrl = `${apiBase}/charts/${type}?t=${Date.now()}`;

  const chartContent = (
    <img
      ref={imgRef}
      src={chartUrl}
      alt={title}
      style={{ width: "100%", height: "auto", borderRadius: 6 }}
      onError={(e) => {
        // Fallback to placeholder on error
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );

  return (
    <>
      <div style={{ border: "1px solid var(--fg-border)", borderRadius: 8, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{title}</h4>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setIsExpanded(true)}
              className="btn"
              style={{ fontSize: 12, padding: "4px 10px" }}
              title="Expand chart"
            >
              ⛶
            </button>
            <button
              onClick={downloadChart}
              className="btn"
              style={{ fontSize: 12, padding: "4px 10px" }}
              title="Download chart"
            >
              ↓
            </button>
          </div>
        </div>
        {chartContent}
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 40
          }}
          onClick={() => setIsExpanded(false)}
        >
          <div
            style={{
              background: "var(--bg-primary)",
              borderRadius: 12,
              padding: 32,
              maxWidth: 1200,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{title}</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="btn"
                style={{ fontSize: 18 }}
              >
                ✕
              </button>
            </div>
            <div style={{ width: "100%", height: "auto", display: "flex", justifyContent: "center" }}>
              <img
                src={chartUrl}
                alt={title}
                style={{ maxWidth: "100%", maxHeight: "70vh", width: "auto", height: "auto", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
