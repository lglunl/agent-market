#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
URL="http://127.0.0.1:${PORT}"
export PATH="${HOME}/.local/bin:${PATH}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "未找到 cloudflared（期望在 PATH 或 ~/.local/bin）。"
  echo "可用 Hiddify 代理下载："
  echo "  export https_proxy=http://127.0.0.1:12334"
  echo "  wget -O ~/.local/bin/cloudflared \\"
  echo "    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
  echo "  chmod +x ~/.local/bin/cloudflared"
  exit 1
fi

# 国内直连 api.trycloudflare.com 常超时；若本机有 Hiddify 混合端口则自动走代理
if [[ -z "${https_proxy:-}${HTTPS_PROXY:-}" ]]; then
  if timeout 1 bash -c 'echo >/dev/tcp/127.0.0.1/12334' 2>/dev/null; then
    export http_proxy="http://127.0.0.1:12334"
    export https_proxy="http://127.0.0.1:12334"
    export HTTP_PROXY="$http_proxy"
    export HTTPS_PROXY="$https_proxy"
    echo "检测到 Hiddify :12334，cloudflared 将经代理连接 Cloudflare。"
  fi
fi

echo "Quick Tunnel -> ${URL}"
echo "启动后把输出里的 https://xxxx.trycloudflare.com 记下来；"
echo "若 Agent 链接里用了旧域名，到管理台用「URL 前缀一键替换」批量更新。"
# 经 HTTP 代理时 quic 易断，固定用 http2
exec cloudflared tunnel --url "${URL}" --protocol http2
