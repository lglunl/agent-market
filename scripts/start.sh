#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="${HOME}/.local/node/bin:${PATH}"
export PORT="${PORT:-3000}"

if [[ ! -d node_modules ]]; then
  npm install
fi

if [[ ! -d .next ]]; then
  npm run build
fi

echo "Starting Agent 超市 on http://localhost:${PORT}"
exec npm start
