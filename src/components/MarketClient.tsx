"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Agent, Settings } from "@/lib/types";
import { AgentCard } from "./AgentCard";

export function MarketClient({
  initialAgents,
  initialCategories,
  settings,
}: {
  initialAgents: Agent[];
  initialCategories: string[];
  settings: Settings;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [agents, setAgents] = useState(initialAgents);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (category) params.set("category", category);
        const res = await fetch(`/api/agents?${params.toString()}`);
        const data = await res.json();
        setAgents(data.agents || []);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q, category]);

  const title = useMemo(
    () => settings.site_name || "Agent 超市",
    [settings.site_name]
  );

  const totalClicks = useMemo(
    () => initialAgents.reduce((sum, a) => sum + a.click_count, 0),
    [initialAgents]
  );

  function scrollToAgents() {
    document.getElementById("agents")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="container" style={{ padding: "0 0 3.5rem" }}>
      {/* ===== Hero ===== */}
      <section className="hero">
        <span className="hero-eyebrow">AGENT MARKET · 本地 AI 应用聚合</span>
        <h1 className="hero-title">
          {title}
          <span className="grad"> 一站式</span>
          <br />
          发现与使用你的 Agent
        </h1>
        <p className="hero-sub">
          {settings.announcement ||
            "浏览、筛选并一键打开你部署在本地与公网的各类 AI Agent，探索它们的每一次能力。"}
        </p>
        <div className="hero-actions">
          <button className="btn" type="button" onClick={scrollToAgents}>
            浏览 Agent
          </button>
          <Link className="btn ghost" href="/admin">
            进入管理台
          </Link>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-num">{initialAgents.length}</div>
            <div className="stat-label">已上架 Agent</div>
          </div>
          <div className="stat">
            <div className="stat-num">{initialCategories.length}</div>
            <div className="stat-label">分类</div>
          </div>
          <div className="stat">
            <div className="stat-num">{totalClicks}</div>
            <div className="stat-label">累计打开</div>
          </div>
        </div>

        <div className="hero-divider" />
      </section>

      {/* ===== Search / filter ===== */}
      <section id="agents">
        <div className="searchbar">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索名称、简介、标签…"
          />
          <div className="cat-group">
            <button
              type="button"
              className={`chip ${category === "" ? "active" : ""}`}
              onClick={() => setCategory("")}
            >
              全部
            </button>
            {initialCategories.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${category === c ? "active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="section-head">
          <h2>{category ? category : "全部 Agent"}</h2>
          <span className="count">
            {loading ? "…" : `${agents.length} 个结果`}
          </span>
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)" }}>加载中…</p>
        ) : agents.length === 0 ? (
          <div className="panel" style={{ textAlign: "center", padding: "2.8rem 1rem" }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>暂无已上架 Agent</p>
          </div>
        ) : (
          <div className="card-grid">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
