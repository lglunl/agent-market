const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const FONT = "'Noto Sans CJK SC','Noto Sans SC',sans-serif";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------- Cover 1: Poultry Carbon ----------
const cover1 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>
    <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12524c"/>
      <stop offset="0.5" stop-color="#0e3733"/>
      <stop offset="1" stop-color="#071f1c"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.78" cy="0.18" r="0.7">
      <stop offset="0" stop-color="#08988f" stop-opacity="0.55"/>
      <stop offset="0.6" stop-color="#08988f" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#08988f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3dd6c6"/>
      <stop offset="1" stop-color="#c9efbf"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#bg1)"/>
  <rect width="1280" height="800" fill="url(#glow1)"/>
  <!-- 网格纹理 -->
  <g stroke="#c9efbf" stroke-opacity="0.05" stroke-width="1">
    ${Array.from({length:33},(_,i)=>`<line x1="${i*40}" y1="0" x2="${i*40}" y2="800"/>`).join("")}
    ${Array.from({length:21},(_,i)=>`<line x1="0" y1="${i*40}" x2="1280" y2="${i*40}"/>`).join("")}
  </g>
  <!-- 碳分子/叶装饰 -->
  <g transform="translate(930,150)">
    <circle cx="0" cy="0" r="150" fill="none" stroke="#08988f" stroke-width="2" stroke-opacity="0.4"/>
    <circle cx="0" cy="0" r="112" fill="none" stroke="#08988f" stroke-width="2" stroke-opacity="0.25"/>
    <circle cx="0" cy="0" r="70" fill="none" stroke="#c9efbf" stroke-width="3" stroke-opacity="0.5"/>
    <circle cx="0" cy="0" r="12" fill="#c9efbf"/>
  </g>
  <g transform="translate(1100,470)" opacity="0.9">
    <text x="0" y="0" font-family="${FONT}" font-size="120" fill="#c9efbf" text-anchor="middle" font-weight="700">CO₂</text>
  </g>

  <!-- 标题 -->
  <g transform="translate(96,180)">
    <text x="0" y="0" font-family="${FONT}" font-size="30" letter-spacing="6" fill="#3dd6c6" font-weight="700">POULTRY CARBON · TEST</text>
    <text x="0" y="96" font-family="${FONT}" font-size="86" fill="#eef7f2" font-weight="800">蛋鸡养殖场</text>
    <text x="0" y="206" font-family="${FONT}" font-size="86" fill="#eef7f2" font-weight="800">碳排放监测与核算系统</text>
    <rect x="0" y="248" width="96" height="6" rx="3" fill="url(#accent1)"/>
    <text x="0" y="330" font-family="${FONT}" font-size="30" fill="#bfd8cf">有来源的活动数据 · 双口径核算 · 历史追溯</text>
  </g>

  <!-- 标签 -->
  <g transform="translate(96,620)" font-family="${FONT}" font-size="26" font-weight="600">
    <rect x="0" y="-40" width="172" height="58" rx="29" fill="#08988f" fill-opacity="0.18" stroke="#3dd6c6" stroke-opacity="0.6"/>
    <text x="86" y="0" fill="#c9efbf" text-anchor="middle">碳排放</text>
    <rect x="192" y="-40" width="172" height="58" rx="29" fill="#08988f" fill-opacity="0.18" stroke="#3dd6c6" stroke-opacity="0.6"/>
    <text x="278" y="0" fill="#c9efbf" text-anchor="middle">双口径核算</text>
    <rect x="384" y="-40" width="172" height="58" rx="29" fill="#08988f" fill-opacity="0.18" stroke="#3dd6c6" stroke-opacity="0.6"/>
    <text x="470" y="0" fill="#c9efbf" text-anchor="middle">历史追溯</text>
  </g>
</svg>`;

// ---------- Cover 2: 蛋鸡精准饲养决策智能体 ----------
const cover2 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e3a8a"/>
      <stop offset="0.5" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#0b1120"/>
    </linearGradient>
    <radialGradient id="glow2" cx="0.2" cy="0.12" r="0.7">
      <stop offset="0" stop-color="#2563eb" stop-opacity="0.5"/>
      <stop offset="0.6" stop-color="#2563eb" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3b82f6"/>
      <stop offset="1" stop-color="#60a5fa"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#bg2)"/>
  <rect width="1280" height="800" fill="url(#glow2)"/>
  <g stroke="#60a5fa" stroke-opacity="0.05" stroke-width="1">
    ${Array.from({length:33},(_,i)=>`<line x1="${i*40}" y1="0" x2="${i*40}" y2="800"/>`).join("")}
    ${Array.from({length:21},(_,i)=>`<line x1="0" y1="${i*40}" x2="1280" y2="${i*40}"/>`).join("")}
  </g>
  <!-- 数据点折线装饰 -->
  <g transform="translate(920,140)" stroke="#3b82f6" stroke-width="3" fill="none" opacity="0.7">
    <polyline points="0,180 60,120 120,150 180,80 240,110 300,40" />
    <polyline points="0,180 60,120 120,150 180,80 240,110 300,40" transform="translate(0,60)" stroke-opacity="0.4"/>
  </g>
  <g fill="#60a5fa">
    <circle cx="0" cy="180" r="7"/>
    <circle cx="60" cy="120" r="7"/>
    <circle cx="120" cy="150" r="7"/>
    <circle cx="180" cy="80" r="7"/>
    <circle cx="240" cy="110" r="7"/>
    <circle cx="300" cy="40" r="7"/>
  </g>

  <!-- 标题 -->
  <g transform="translate(96,180)">
    <text x="0" y="0" font-family="${FONT}" font-size="30" letter-spacing="5" fill="#60a5fa" font-weight="700">PRECISION FEEDING AGENT</text>
    <text x="0" y="96" font-family="${FONT}" font-size="82" fill="#f1f5f9" font-weight="800">蛋鸡精准饲养决策智能体</text>
    <rect x="0" y="150" width="96" height="6" rx="3" fill="url(#accent2)"/>
    <text x="0" y="238" font-family="${FONT}" font-size="30" fill="#c3d0e6">生产数据 · 智能助手 · 规则模式（第一阶段）</text>
  </g>

  <!-- 标签 -->
  <g transform="translate(96,620)" font-family="${FONT}" font-size="26" font-weight="600">
    <rect x="0" y="-40" width="172" height="58" rx="29" fill="#2563eb" fill-opacity="0.18" stroke="#60a5fa" stroke-opacity="0.6"/>
    <text x="86" y="0" fill="#dbeafe" text-anchor="middle">精准饲养</text>
    <rect x="192" y="-40" width="172" height="58" rx="29" fill="#2563eb" fill-opacity="0.18" stroke="#60a5fa" stroke-opacity="0.6"/>
    <text x="278" y="0" fill="#dbeafe" text-anchor="middle">生产数据</text>
    <rect x="384" y="-40" width="172" height="58" rx="29" fill="#2563eb" fill-opacity="0.18" stroke="#60a5fa" stroke-opacity="0.6"/>
    <text x="470" y="0" fill="#dbeafe" text-anchor="middle">规则模式</text>
  </g>
</svg>`;

async function main() {
  const outDir = path.join(__dirname, "..", "uploads");
  const c1 = path.join(outDir, "poultry-carbon-cover.png");
  const c2 = path.join(outDir, "poultry-feed-cover.png");

  await sharp(Buffer.from(cover1)).png().toFile(c1);
  await sharp(Buffer.from(cover2)).png().toFile(c2);
  console.log("written:", c1);
  console.log("written:", c2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
