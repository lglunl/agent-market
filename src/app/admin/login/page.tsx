"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="container"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem 0",
      }}
    >
      <form className="panel" onSubmit={onSubmit} style={{ width: "min(420px, 100%)" }}>
        <h1 style={{ marginTop: 0 }}>管理台登录</h1>
        <p style={{ color: "var(--muted)", marginTop: "-0.3rem" }}>
          使用预置管理员账号直接登录（无注册）
        </p>
        <div style={{ display: "grid", gap: "0.85rem" }}>
          <div className="field">
            <label htmlFor="username">用户名</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>
          ) : null}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "登录中…" : "登录"}
          </button>
          <Link className="btn secondary" href="/" style={{ textAlign: "center" }}>
            返回超市
          </Link>
        </div>
      </form>
    </main>
  );
}
