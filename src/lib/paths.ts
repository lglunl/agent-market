import fs from "fs";
import path from "path";

export function projectRoot() {
  return process.cwd();
}

export function dataDir() {
  const dir = path.join(projectRoot(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function dbPath() {
  return process.env.DATABASE_PATH
    ? path.resolve(projectRoot(), process.env.DATABASE_PATH)
    : path.join(dataDir(), "agent-market.db");
}

export function uploadDir() {
  const dir = process.env.UPLOAD_DIR
    ? path.resolve(projectRoot(), process.env.UPLOAD_DIR)
    : path.join(projectRoot(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
