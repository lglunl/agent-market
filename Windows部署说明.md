# Agent 超市 · Windows 部署说明

> 本目录是「Agent 超市」项目的完整备份，从 Linux 服务器导出。
> 在 Windows 上可直接查看源代码、数据库和封面图；若要运行网站，请按下面的步骤操作。

---

## 一、项目是什么

- **名称**：Agent 超市（AI Agent 聚合与分发平台）
- **技术栈**：Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + better-sqlite3
- **数据库**：SQLite（`data/agent-market.db`，含 9 个已上架 Agent）
- **封面图**：`uploads/` 目录（10 张 PNG）

## 二、目录结构说明

```
agent-market/
├── src/                 # 源代码（页面、组件、API、数据库逻辑）
├── data/                # SQLite 数据库（3 个文件，必须一起保留）
│   ├── agent-market.db
│   ├── agent-market.db-wal
│   └── agent-market.db-shm
├── uploads/             # Agent 封面图
├── public/              # 静态资源
├── scripts/             # 启动/隧道脚本
├── .env.local           # 环境配置（含管理员账号密码）
├── package.json         # 依赖清单
└── Dockerfile           # Docker 部署文件
```

> ⚠️ 注意：`data/` 下的 `.db`、`.db-wal`、`.db-shm` 三个文件是数据库，**缺一不可**，拷贝时务必一起拷。

## 三、在 Windows 上运行

### 1. 安装 Node.js 22

- 打开 https://nodejs.org/ ，下载 **LTS 版本**（22.x）的 Windows 安装包（`.msi`）
- 双击安装，一路下一步即可
- 验证：打开 PowerShell，输入 `node -v`，应显示 `v22.x.x`

### 2. 解压项目

- 如果是 `.tar.gz` 压缩包：Windows 10/11 右键 →「全部解压缩」
- 如果是解压好的 `agent-market/` 目录：直接使用

### 3. 打开终端进入项目目录

在 PowerShell 中：

```powershell
cd "D:\你的路径\agent-market"
```

### 4. 安装依赖

```powershell
npm install
```

> 这一步会在 Windows 上重新编译/下载依赖（包括 sharp 图片库），需要联网，耗时 1~3 分钟。

### 5. 构建

```powershell
npm run build
```

### 6. 启动

```powershell
npm start
```

### 7. 访问

打开浏览器，访问：

```
http://localhost:3000
```

## 四、登录管理台

- 前台首页：`http://localhost:3000/`
- 管理台登录：`http://localhost:3000/admin/login`
- 默认账号：`admin`
- 默认密码：见 `.env.local` 中的 `ADMIN_PASSWORD`（或 `admin123`）

## 五、常见问题

| 问题 | 解决 |
|------|------|
| `npm install` 报 sharp 编译错误 | 用管理员身份运行 PowerShell，或改用 `npm install --ignore-scripts` 后手动装 sharp |
| 看不到 `.env.local` 等点开头文件 | Windows 资源管理器默认隐藏，勾选「查看 → 隐藏的项目」即可 |
| 打开源码乱码/挤成一行 | 用 VS Code 打开，不要用记事本 |
| 端口 3000 被占用 | 改 `package.json` 里的 start 脚本端口，或用 `PORT=3001 npm start` |

## 六、说明

- 本项目在 Linux 上开发运行，Windows 上运行需重装依赖，但**数据、封面、配置完全通用**。
- 若要长期公网访问，原 Linux 环境使用了 Cloudflare Quick Tunnel；Windows 上也可用同样方式（需下载 cloudflared）。
- 数据备份：只需保留 `data/` 和 `uploads/` 两个目录即可完整恢复全部内容。
