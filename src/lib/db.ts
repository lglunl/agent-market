import Database from "better-sqlite3";
import { dbPath } from "./paths";
import type { Agent, AgentInput, Settings } from "./types";
import { randomUUID } from "crypto";

type AgentRow = {
  id: string;
  name: string;
  description: string;
  cover: string | null;
  url: string;
  tags: string;
  category: string;
  sort_order: number;
  published: number;
  click_count: number;
  created_at: string;
  updated_at: string;
};

declare global {
  var __agentMarketDb: Database.Database | undefined;
}

function rowToAgent(row: AgentRow): Agent {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags || "[]");
  } catch {
    tags = [];
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    cover: row.cover,
    url: row.url,
    tags,
    category: row.category || "",
    sort_order: row.sort_order,
    published: !!row.published,
    click_count: row.click_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function getDb() {
  if (!global.__agentMarketDb) {
    const db = new Database(dbPath());
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        cover TEXT,
        url TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        category TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        published INTEGER NOT NULL DEFAULT 1,
        click_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT ''
      );

      CREATE INDEX IF NOT EXISTS idx_agents_sort ON agents(sort_order ASC, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_agents_published ON agents(published);
      CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
    `);

    const defaults: Record<string, string> = {
      site_name: "Agent 超市",
      public_url_prefix: "",
      announcement: "",
    };
    const insertSetting = db.prepare(
      "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
    );
    for (const [k, v] of Object.entries(defaults)) {
      insertSetting.run(k, v);
    }

    global.__agentMarketDb = db;
  }
  return global.__agentMarketDb;
}

export function getSettings(): Settings {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    site_name: map.site_name || "Agent 超市",
    public_url_prefix: map.public_url_prefix || "",
    announcement: map.announcement || "",
  };
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  const tx = db.transaction((entries: [string, string][]) => {
    for (const [k, v] of entries) stmt.run(k, v);
  });
  const entries = Object.entries(partial).filter(
    ([, v]) => typeof v === "string"
  ) as [string, string][];
  tx(entries);
  return getSettings();
}

export function listAgents(opts?: {
  publishedOnly?: boolean;
  q?: string;
  category?: string;
}): Agent[] {
  const db = getDb();
  const where: string[] = [];
  const params: unknown[] = [];

  if (opts?.publishedOnly) {
    where.push("published = 1");
  }
  if (opts?.category) {
    where.push("category = ?");
    params.push(opts.category);
  }
  if (opts?.q) {
    where.push(
      "(name LIKE ? OR description LIKE ? OR tags LIKE ? OR category LIKE ?)"
    );
    const like = `%${opts.q}%`;
    params.push(like, like, like, like);
  }

  const sql = `SELECT * FROM agents ${
    where.length ? `WHERE ${where.join(" AND ")}` : ""
  } ORDER BY sort_order ASC, updated_at DESC`;

  const rows = db.prepare(sql).all(...params) as AgentRow[];
  return rows.map(rowToAgent);
}

export function getAgent(id: string): Agent | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM agents WHERE id = ?").get(id) as
    | AgentRow
    | undefined;
  return row ? rowToAgent(row) : null;
}

export function createAgent(input: AgentInput): Agent {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  const maxSort = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM agents")
    .get() as { m: number };
  const sortOrder =
    typeof input.sort_order === "number" ? input.sort_order : maxSort.m + 1;

  db.prepare(
    `INSERT INTO agents
      (id, name, description, cover, url, tags, category, sort_order, published, click_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).run(
    id,
    input.name.trim(),
    (input.description || "").trim(),
    input.cover ?? null,
    input.url.trim(),
    JSON.stringify(input.tags || []),
    (input.category || "").trim(),
    sortOrder,
    input.published === false ? 0 : 1,
    now,
    now
  );

  return getAgent(id)!;
}

export function updateAgent(id: string, input: Partial<AgentInput>): Agent | null {
  const existing = getAgent(id);
  if (!existing) return null;

  const db = getDb();
  const now = new Date().toISOString();
  const next = {
    name: input.name?.trim() ?? existing.name,
    description:
      input.description !== undefined
        ? input.description.trim()
        : existing.description,
    cover: input.cover !== undefined ? input.cover : existing.cover,
    url: input.url?.trim() ?? existing.url,
    tags: input.tags ?? existing.tags,
    category:
      input.category !== undefined
        ? input.category.trim()
        : existing.category,
    sort_order:
      typeof input.sort_order === "number"
        ? input.sort_order
        : existing.sort_order,
    published:
      input.published !== undefined ? input.published : existing.published,
  };

  db.prepare(
    `UPDATE agents SET
      name = ?, description = ?, cover = ?, url = ?, tags = ?,
      category = ?, sort_order = ?, published = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    next.name,
    next.description,
    next.cover,
    next.url,
    JSON.stringify(next.tags),
    next.category,
    next.sort_order,
    next.published ? 1 : 0,
    now,
    id
  );

  return getAgent(id);
}

export function deleteAgent(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM agents WHERE id = ?").run(id);
  return result.changes > 0;
}

export function reorderAgents(ids: string[]): void {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    "UPDATE agents SET sort_order = ?, updated_at = ? WHERE id = ?"
  );
  const tx = db.transaction((ordered: string[]) => {
    ordered.forEach((id, index) => stmt.run(index, now, id));
  });
  tx(ids);
}

export function replaceUrlPrefix(from: string, to: string): number {
  const db = getDb();
  const now = new Date().toISOString();
  const agents = db
    .prepare("SELECT id, url FROM agents WHERE url LIKE ?")
    .all(`${from}%`) as { id: string; url: string }[];

  const stmt = db.prepare(
    "UPDATE agents SET url = ?, updated_at = ? WHERE id = ?"
  );
  const tx = db.transaction(() => {
    for (const a of agents) {
      const next = to + a.url.slice(from.length);
      stmt.run(next, now, a.id);
    }
  });
  tx();
  return agents.length;
}

export function incrementClick(id: string): Agent | null {
  const db = getDb();
  db.prepare(
    "UPDATE agents SET click_count = click_count + 1 WHERE id = ?"
  ).run(id);
  return getAgent(id);
}

export function listCategories(publishedOnly = true): string[] {
  const db = getDb();
  const sql = publishedOnly
    ? `SELECT DISTINCT category FROM agents WHERE published = 1 AND category != '' ORDER BY category ASC`
    : `SELECT DISTINCT category FROM agents WHERE category != '' ORDER BY category ASC`;
  const rows = db.prepare(sql).all() as { category: string }[];
  return rows.map((r) => r.category);
}
