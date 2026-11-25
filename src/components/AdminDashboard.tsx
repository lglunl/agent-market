"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Agent, Settings } from "@/lib/types";

type FormState = {
  id?: string;
  name: string;
  description: string;
  cover: string;
  url: string;
  tags: string;
  category: string;
  published: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  description: "",
  cover: "",
  url: "",
  tags: "",
  category: "",
  published: true,
});

export function AdminDashboard({
  initialAgents,
  initialSettings,
  username,
}: {
  initialAgents: Agent[];
  initialSettings: Settings;
  username: string;
}) {
  const router = useRouter();
  const [agents, setAgents] = useState(initialAgents);
  const [settings, setSettings] = useState(initialSettings);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [replaceFrom, setReplaceFrom] = useState(
    initialSettings.public_url_prefix || ""
  );
  const [replaceTo, setReplaceTo] = useState("");

  const editing = !!form.id;

  async function refreshAgents() {
    const res = await fetch("/api/agents?all=1");
    const data = await res.json();
    setAgents(data.agents || []);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  async function uploadCover(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "上传失败");
    setForm((f) => ({ ...f, cover: data.url }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        cover: form.cover || null,
        url: form.url,
        tags: form.tags
          .split(/[,，]/)
          .map((t) => t.trim())
          .filter(Boolean),
        category: form.category,
        published: form.published,
      };

      const res = await fetch(form.id ? `/api/agents/${form.id}` : "/api/agents", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      setForm(emptyForm());
      setMessage(editing ? "已更新，前台立即生效" : "已添加");
      await refreshAgents();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  function editAgent(agent: Agent) {
    setForm({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      cover: agent.cover || "",
      url: agent.url,
      tags: agent.tags.join(", "),
      category: agent.category,
      published: agent.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeAgent(id: string) {
    if (!confirm("确认删除该 Agent？")) return;
    const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "删除失败");
      return;
    }
    if (form.id === id) setForm(emptyForm());
    setMessage("已删除");
    await refreshAgents();
  }

  async function togglePublished(agent: Agent) {
    const res = await fetch(`/api/agents/${agent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !agent.published }),
    });
    if (res.ok) await refreshAgents();
  }

  async function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ids = agents.map((a) => a.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    const next = ids
      .map((id) => agents.find((a) => a.id === id)!)
      .filter(Boolean);
    setAgents(next);
    setDragId(null);
    await fetch("/api/agents/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setMessage("排序已保存");
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "设置保存失败");
      return;
    }
    setSettings(data.settings);
    setMessage("站点设置已保存");
  }

  async function runReplace(e: FormEvent) {
    e.preventDefault();
    if (!replaceFrom) {
      setMessage("请填写原前缀");
      return;
    }
    if (!confirm(`将所有以「${replaceFrom}」开头的 URL 替换为「${replaceTo}」？`)) {
      return;
    }
    const res = await fetch("/api/agents/replace-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: replaceFrom, to: replaceTo }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "替换失败");
      return;
    }
    setMessage(`已批量更新 ${data.updated} 条 URL`);
    await refreshAgents();
  }

  const totalClicks = useMemo(
    () => agents.reduce((sum, a) => sum + a.click_count, 0),
    [agents]
  );

  return (
    <main className="container" style={{ padding: "1.5rem 0 3rem" }}>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>管理台</h1>
          <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>
            已登录：{username} · 共 {agents.length} 个 Agent · {totalClicks} 次点击
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link className="btn secondary" href="/">
            前台超市
          </Link>
          <button className="btn secondary" type="button" onClick={logout}>
            退出
          </button>
        </div>
      </header>

      {message ? (
        <div className="panel" style={{ marginBottom: "1rem", color: "var(--accent)" }}>
          {message}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <form className="panel" onSubmit={onSubmit}>
          <h2 style={{ marginTop: 0 }}>{editing ? "编辑 Agent" : "添加 Agent"}</h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <div className="field">
              <label>名称 *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>简介</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="field">
              <label>目标 URL *</label>
              <input
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="field">
              <label>分类</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="例如：写作 / 研发 / 运维"
              />
            </div>
            <div className="field">
              <label>标签（逗号分隔）</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="rag, 本地, demo"
              />
            </div>
            <div className="field">
              <label>封面图</label>
              <input
                value={form.cover}
                onChange={(e) => setForm({ ...form, cover: e.target.value })}
                placeholder="/uploads/xxx.png 或外链"
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    await uploadCover(file);
                    setMessage("封面已上传");
                  } catch (err) {
                    setMessage(err instanceof Error ? err.message : "上传失败");
                  }
                }}
              />
              {form.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.cover}
                  alt="cover"
                  style={{
                    width: "100%",
                    maxHeight: 160,
                    objectFit: "cover",
                    borderRadius: 10,
                    marginTop: 6,
                  }}
                />
              ) : null}
            </div>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              上架（前台可见）
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "保存中…" : editing ? "保存修改" : "添加"}
              </button>
              {editing ? (
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => setForm(emptyForm())}
                >
                  取消编辑
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
          <form className="panel" onSubmit={saveSettings}>
            <h2 style={{ marginTop: 0 }}>站点设置</h2>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div className="field">
                <label>站点名</label>
                <input
                  value={settings.site_name}
                  onChange={(e) =>
                    setSettings({ ...settings, site_name: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label>公网 URL 前缀（Quick Tunnel 域名）</label>
                <input
                  value={settings.public_url_prefix}
                  onChange={(e) =>
                    setSettings({ ...settings, public_url_prefix: e.target.value })
                  }
                  placeholder="https://xxxx.trycloudflare.com"
                />
              </div>
              <div className="field">
                <label>公告</label>
                <textarea
                  rows={3}
                  value={settings.announcement}
                  onChange={(e) =>
                    setSettings({ ...settings, announcement: e.target.value })
                  }
                />
              </div>
              <button className="btn" type="submit">
                保存设置
              </button>
            </div>
          </form>

          <form className="panel" onSubmit={runReplace}>
            <h2 style={{ marginTop: 0 }}>URL 前缀一键替换</h2>
            <p style={{ color: "var(--muted)", marginTop: 0 }}>
              隧道域名变了时，批量改所有 Agent 目标链接。
            </p>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div className="field">
                <label>原前缀</label>
                <input
                  value={replaceFrom}
                  onChange={(e) => setReplaceFrom(e.target.value)}
                  placeholder="https://old.trycloudflare.com"
                />
              </div>
              <div className="field">
                <label>新前缀</label>
                <input
                  value={replaceTo}
                  onChange={(e) => setReplaceTo(e.target.value)}
                  placeholder="https://new.trycloudflare.com"
                />
              </div>
              <button className="btn secondary" type="submit">
                执行替换
              </button>
            </div>
          </form>
        </div>
      </div>

      <section className="panel">
        <h2 style={{ marginTop: 0 }}>Agent 列表（拖拽排序）</h2>
        {agents.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>还没有 Agent，先在左侧添加。</p>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className={`admin-row ${dragId === agent.id ? "dragging" : ""}`}
              draggable
              onDragStart={() => setDragId(agent.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(agent.id)}
              onDragEnd={() => setDragId(null)}
            >
              <span style={{ color: "var(--muted)" }}>⠿</span>
              {agent.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agent.cover} alt="" />
              ) : (
                <div className="thumb">无图</div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>
                  {agent.name}{" "}
                  <span className="chip">
                    {agent.published ? "上架" : "下架"}
                  </span>{" "}
                  <span className="chip">{agent.click_count} 次</span>
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.85rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {agent.category ? `${agent.category} · ` : ""}
                  {agent.url}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => editAgent(agent)}
                >
                  编辑
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => togglePublished(agent)}
                >
                  {agent.published ? "下架" : "上架"}
                </button>
                <button
                  className="btn danger"
                  type="button"
                  onClick={() => removeAgent(agent.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
