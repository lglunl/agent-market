#!/usr/bin/env bash
# Agent 超市（agent-market）云端更新脚本：拉代码 + 重建容器
# 用法：./deploy.sh
# 可通过环境变量 DEPLOY_BRANCH 覆盖要部署的分支，默认 main
set -euo pipefail
cd "$(dirname "$0")"

BRANCH="${DEPLOY_BRANCH:-main}"

echo "==> 拉取分支 ${BRANCH}"
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
if ! git pull --ff-only origin "${BRANCH}"; then
  echo "==> 无法快进合并，改用 reset --hard 对齐远程（本机未提交改动会被丢弃）"
  # .env 与 data/、uploads/ 均在 .gitignore 内，reset 不会影响它们
  git reset --hard "origin/${BRANCH}"
fi

echo "==> 构建并启动"
docker compose -f docker-compose.prod.yml up -d --build

echo "==> 当前状态"
docker compose -f docker-compose.prod.yml ps
