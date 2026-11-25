#!/usr/bin/env bash
# Agent 超市 云端数据备份：导出干净 SQLite 副本（合并 WAL）并保留最近 7 天
# 用法：./backup.sh   或   cron 每日执行
set -euo pipefail
cd "$(dirname "$0")"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/agent-market}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "${BACKUP_DIR}"

echo "==> 在容器内导出干净副本（VACUUM INTO，合并 WAL）"
docker compose -f docker-compose.prod.yml exec -T app node scripts/export-db.js

echo "==> 复制到 ${BACKUP_DIR}（data 为 bind mount，直接 cp 宿主机文件）"
cp ./data/agent-market.backup.sqlite "${BACKUP_DIR}/agent-market-${STAMP}.sqlite"

echo "==> 清理 7 天前的备份"
find "${BACKUP_DIR}" -name 'agent-market-*.sqlite' -mtime +7 -delete

echo "==> 完成：${BACKUP_DIR}/agent-market-${STAMP}.sqlite"
