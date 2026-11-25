"use client";

import type { Agent } from "@/lib/types";

export function AgentCard({ agent }: { agent: Agent }) {
  async function openAgent() {
    try {
      const res = await fetch(`/api/agents/${agent.id}/click`, { method: "POST" });
      const data = await res.json();
      window.open(data.url || agent.url, "_blank", "noopener,noreferrer");
    } catch {
      window.open(agent.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <article className="agent-card">
      <button
        type="button"
        onClick={openAgent}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "block",
          width: "100%",
        }}
      >
        {agent.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={agent.cover} alt={agent.name} />
        ) : (
          <div className="cover-fallback">暂无封面</div>
        )}

        <div className="card-body">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "0.5rem",
              alignItems: "flex-start",
            }}
          >
            <h3 className="card-title">{agent.name}</h3>
            {agent.category ? <span className="chip">{agent.category}</span> : null}
          </div>

          <p className="card-desc">{agent.description || "暂无简介"}</p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.35rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {agent.tags.slice(0, 3).map((tag) => (
                <span className="chip" key={tag}>
                  {tag}
                </span>
              ))}
              <span className="chip">{agent.click_count} 次打开</span>
            </div>
          </div>

          <div style={{ marginTop: "0.75rem" }}>
            <span className="card-open">
              立即打开 <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
