/**
 * 一次性任务：把 2 个待上架 agent 加入 AI 超市。
 * 用法：
 *   node add-pending-agents.js          # dry-run：只生成封面 + 打印预览，不写库
 *   node add-pending-agents.js --apply  # 实际生成封面 + 入库（按 url 幂等去重）
 */
const sharp = require("sharp");
const path = require("path");
const Database = require("better-sqlite3");
const { randomUUID } = require("crypto");

const apply = process.argv.includes("--apply");
const FONT = "'Noto Sans CJK SC','Noto Sans SC',sans-serif";
const ROOT = path.join(__dirname, "..");
const DB_PATH = path.join(ROOT, "data", "agent-market.db");
const UPLOAD_DIR = path.join(ROOT, "uploads");

// ---------- 待上架 agent 定义 ----------
const agents = [
  {
    name: "科研设备采购选型 Agent",
    desc: "设备选型前期情报助手：需求澄清、公开检索、厂家整理、实力参考、本院匹配、对比简报。多源公开厂家发现、来源可核验，支持国产替代提示。",
    coverFile: "equip-select-cover.png",
    url: "https://infrared-alice-off-bass.trycloudflare.com/",
    tags: ["设备选型", "公开情报", "需求澄清", "对比简报", "国产替代"],
    cat: "科研",
  },
  {
    name: "Team Agent",
    desc: "团队协作型 Agent：决定、执行、留痕都在同一条线程里。多成员协作、任务决策与执行记录，支持邮箱/网盘/日历等连接器。",
    coverFile: "team-agent-cover.png",
    url: "https://specify-hip-lender-geometry.trycloudflare.com/",
    tags: ["团队协作", "线程化", "任务决策", "执行留痕"],
    cat: "AI 助手",
  },
];

// ---------- 封面 SVG ----------
function coverSvg(a) {
  if (a.name.startsWith("科研")) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e3a8a"/>
      <stop offset="0.5" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#0b1120"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.2" cy="0.1" r="0.75">
      <stop offset="0" stop-color="#2563eb" stop-opacity="0.5"/>
      <stop offset="0.6" stop-color="#2563eb" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3b82f6"/>
      <stop offset="1" stop-color="#60a5fa"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#bg)"/>
  <rect width="1280" height="800" fill="url(#glow)"/>
  <g stroke="#60a5fa" stroke-opacity="0.05" stroke-width="1">
    ${Array.from({ length: 33 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="800"/>`).join("")}
    ${Array.from({ length: 21 }, (_, i) => `<line x1="0" y1="${i * 40}" x2="1280" y2="${i * 40}"/>`).join("")}
  </g>
  <!-- 放大镜 + 数据点 -->
  <g transform="translate(940,150)" fill="none" stroke="#3b82f6" stroke-width="5" opacity="0.8">
    <circle cx="0" cy="0" r="90"/>
    <line x1="68" y1="68" x2="140" y2="140" stroke-linecap="round"/>
  </g>
  <g fill="#ffb400">
    <circle cx="-45" cy="0" r="8"/><circle cx="45" cy="0" r="8"/><circle cx="0" cy="-45" r="8"/><circle cx="0" cy="45" r="8"/>
  </g>
  <g transform="translate(96,180)">
    <text x="0" y="0" font-family="${FONT}" font-size="30" letter-spacing="5" fill="#60a5fa" font-weight="700">EQUIPMENT SELECTION AGENT</text>
    <text x="0" y="96" font-family="${FONT}" font-size="82" fill="#f1f5f9" font-weight="800">科研设备采购选型 Agent</text>
    <rect x="0" y="150" width="96" height="6" rx="3" fill="url(#accent)"/>
    <text x="0" y="240" font-family="${FONT}" font-size="30" fill="#c3d0e6">设备选型前期情报助手 · 公开情报可核验</text>
  </g>
  <g transform="translate(96,620)" font-family="${FONT}" font-size="26" font-weight="600">
    <rect x="0" y="-40" width="172" height="58" rx="29" fill="#2563eb" fill-opacity="0.18" stroke="#60a5fa" stroke-opacity="0.6"/>
    <text x="86" y="0" fill="#dbeafe" text-anchor="middle">需求澄清</text>
    <rect x="192" y="-40" width="172" height="58" rx="29" fill="#2563eb" fill-opacity="0.18" stroke="#60a5fa" stroke-opacity="0.6"/>
    <text x="278" y="0" fill="#dbeafe" text-anchor="middle">实力参考</text>
    <rect x="384" y="-40" width="172" height="58" rx="29" fill="#2563eb" fill-opacity="0.18" stroke="#60a5fa" stroke-opacity="0.6"/>
    <text x="470" y="0" fill="#dbeafe" text-anchor="middle">对比简报</text>
  </g>
</svg>`;
  }

  // Team Agent
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#181d24"/>
      <stop offset="0.5" stop-color="#0f1317"/>
      <stop offset="1" stop-color="#0a0d10"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.12" r="0.7">
      <stop offset="0" stop-color="#2fe3b0" stop-opacity="0.32"/>
      <stop offset="0.6" stop-color="#2fe3b0" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#2fe3b0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2fe3b0"/>
      <stop offset="1" stop-color="#7cf5cf"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#bg)"/>
  <rect width="1280" height="800" fill="url(#glow)"/>
  <g stroke="#2fe3b0" stroke-opacity="0.05" stroke-width="1">
    ${Array.from({ length: 33 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="800"/>`).join("")}
    ${Array.from({ length: 21 }, (_, i) => `<line x1="0" y1="${i * 40}" x2="1280" y2="${i * 40}"/>`).join("")}
  </g>
  <!-- 四格 logo -->
  <g transform="translate(950,150)">
    <rect x="-70" y="-70" width="140" height="140" rx="30" fill="#111"/>
    <rect x="-54" y="-54" width="52" height="52" rx="12" fill="#2fe3b0"/>
    <rect x="6" y="-54" width="52" height="52" rx="12" fill="#4c8dff"/>
    <rect x="-54" y="6" width="52" height="52" rx="12" fill="#ff8a3d"/>
    <rect x="6" y="6" width="52" height="52" rx="12" fill="#f25c8a"/>
  </g>
  <!-- 线程连线 -->
  <g transform="translate(700,520)" stroke="#2fe3b0" stroke-opacity="0.35" stroke-width="2" fill="none">
    <path d="M0,0 C60,-40 120,-40 180,0"/>
    <path d="M40,20 C100,0 160,0 220,20" stroke-opacity="0.2"/>
  </g>
  <g fill="#2fe3b0">
    <circle cx="0" cy="0" r="7"/><circle cx="180" cy="0" r="7"/><circle cx="90" cy="-22" r="6"/>
  </g>
  <g transform="translate(96,180)">
    <text x="0" y="0" font-family="${FONT}" font-size="30" letter-spacing="5" fill="#2fe3b0" font-weight="700">TEAM AGENT</text>
    <text x="0" y="96" font-family="${FONT}" font-size="82" fill="#f5f7f9" font-weight="800">Team Agent</text>
    <rect x="0" y="150" width="96" height="6" rx="3" fill="url(#accent)"/>
    <text x="0" y="240" font-family="${FONT}" font-size="30" fill="#b7c2cd">决定、执行、留下，在同一条线程里</text>
  </g>
  <g transform="translate(96,620)" font-family="${FONT}" font-size="26" font-weight="600">
    <rect x="0" y="-40" width="172" height="58" rx="29" fill="#2fe3b0" fill-opacity="0.14" stroke="#2fe3b0" stroke-opacity="0.55"/>
    <text x="86" y="0" fill="#a9f5dd" text-anchor="middle">团队协作</text>
    <rect x="192" y="-40" width="172" height="58" rx="29" fill="#2fe3b0" fill-opacity="0.14" stroke="#2fe3b0" stroke-opacity="0.55"/>
    <text x="278" y="0" fill="#a9f5dd" text-anchor="middle">线程化</text>
    <rect x="384" y="-40" width="172" height="58" rx="29" fill="#2fe3b0" fill-opacity="0.14" stroke="#2fe3b0" stroke-opacity="0.55"/>
    <text x="470" y="0" fill="#a9f5dd" text-anchor="middle">执行留痕</text>
  </g>
</svg>`;
}

async function main() {
  const db = new Database(DB_PATH);
  const now = new Date().toISOString();
  const exists = db.prepare("SELECT 1 FROM agents WHERE url = ?");

  let maxSort = db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM agents").get().m;

  for (const a of agents) {
    // 1) 生成封面（幂等覆盖）
    const outPath = path.join(UPLOAD_DIR, a.coverFile);
    await sharp(Buffer.from(coverSvg(a))).png().toFile(outPath);

    if (exists.get(a.url)) {
      console.log(`[SKIP] 已存在: ${a.name} (${a.url})`);
      continue;
    }

    if (!apply) {
      console.log(`[DRY-RUN] 将新增: ${a.name} | ${a.cat} | ${a.url} | cover=${a.coverFile}`);
      continue;
    }

    const id = randomUUID();
    db.prepare(
      `INSERT INTO agents (id,name,description,cover,url,tags,category,sort_order,published,click_count,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,1,0,?,?)`
    ).run(
      id,
      a.name,
      a.desc,
      `/uploads/${a.coverFile}`,
      a.url,
      JSON.stringify(a.tags),
      a.cat,
      ++maxSort,
      now,
      now
    );
    console.log(`[INSERT] ${a.name} -> ${a.url}`);
  }

  if (!apply) {
    console.log("\n(未带 --apply，仅 dry-run；cron 将以 --apply 运行)");
  }
  db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
