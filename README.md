# Agent 超市

在 Linux 本机展示与管理一批 Agent：访客浏览搜索，管理员增删改、上传封面、改 URL（立刻生效），可用 Cloudflare Quick Tunnel 公网访问。

## 技术栈

- Next.js（前台 + `/admin` + API）
- SQLite（`data/agent-market.db`）
- 本地图片（`uploads/`）
- 管理员账号来自环境变量（无注册）

## 快速开始

```bash
# 需要 Node.js 18+（推荐 22）
cp .env.example .env.local   # 按需改密码
npm install
npm run build
npm start                    # 默认 http://localhost:3000
```

开发模式：

```bash
npm run dev
```

默认管理员：

- 用户名：`admin`（`ADMIN_USERNAME`）
- 密码：`admin123`（`ADMIN_PASSWORD`）

登录地址：`/admin`（未登录会跳到 `/admin/login`）

## Cloudflare Quick Tunnel

先启动本服务，再开隧道：

```bash
# 终端 1
npm start

# 终端 2
./scripts/tunnel.sh
# 或：cloudflared tunnel --url http://localhost:3000
```

输出里的 `https://xxxx.trycloudflare.com` 即为公网入口。  
Quick Tunnel 域名每次可能变：在管理台用「URL 前缀一键替换」批量改 Agent 目标链接；也可把新域名写到「站点设置 → 公网 URL 前缀」备忘。

## Docker（可选）

```bash
docker build -t agent-market .
docker run --rm -p 3000:3000 \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-password \
  -e AUTH_SECRET=long-random-string \
  -v "$PWD/data:/app/data" \
  -v "$PWD/uploads:/app/uploads" \
  agent-market
```

## 功能对照

| 能力 | 说明 |
|------|------|
| 前台卡片 | 封面、名称、简介、标签、分类、点击次数 |
| 搜索 / 分类 | 前台筛选 |
| 管理 CRUD | 增删改、上下架、封面上传 |
| URL 即时生效 | 改完写库，前台下次请求即新值 |
| 拖拽排序 | 管理台列表拖拽保存 `sort_order` |
| 前缀替换 | 隧道域名变更时批量改 URL |
| 点击统计 | 打开 Agent 前 `POST /api/agents/:id/click` |

## 暂不做（三期）

Named Tunnel 固定域名、多管理员、Agent 在线探测。
