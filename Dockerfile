FROM node:22-bookworm-slim AS deps
WORKDIR /app
# 国内服务器加速：npm 走 npmmirror。
# --ignore-scripts 跳过 node-gyp 编译（better-sqlite3 自带 prebuilds/ 预编译二进制，运行时由 lib/binding.js 自动加载）
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && node -e "require('better-sqlite3'); console.log('better-sqlite3 OK')"

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/scripts ./scripts
RUN mkdir -p data uploads
EXPOSE 3000
VOLUME ["/app/data", "/app/uploads"]
CMD ["npm", "start"]
