/**
 * 导出干净 SQLite 副本（VACUUM INTO，合并 WAL）。
 * 供 backup.sh 在容器内调用：node scripts/export-db.js
 */
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const DB_PATH =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), "data", "agent-market.db");
const OUT_PATH =
  process.env.BACKUP_PATH ||
  path.join(process.cwd(), "data", "agent-market.backup.sqlite");

const db = new Database(DB_PATH);
// 先把 WAL 合并回主库文件，保证导出的是一份完整、可独立使用的副本
db.pragma("wal_checkpoint(TRUNCATE)");
try {
  fs.unlinkSync(OUT_PATH);
} catch {
  // 目标文件不存在，忽略
}
db.exec(`VACUUM INTO '${OUT_PATH}'`);
db.close();

console.log(`[export-db] 已导出干净副本: ${OUT_PATH}`);
