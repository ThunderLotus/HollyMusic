#!/bin/bash
# 用 bash 而非 sh：wait -n 需要 bash 4+，dash（/bin/sh）不支持
set -e

# ============ standalone 模式启动脚本 ============
# 与旧版的区别：
# 1. 不再用 `pnpm start`（next start，需完整 node_modules）
#    改用 `node ./server.js`（standalone 产物，含最小化 node_modules）
# 2. 不再用 `pnpm prisma migrate deploy`（运行时镜像无 pnpm/prisma CLI）
#    改用 standalone 内已追踪的 prisma CLI：node ./node_modules/prisma/build/index.js
# 3. 必须显式设置 HOSTNAME=0.0.0.0，否则 server.js 只监听 localhost，nginx 反代连不上

# ============ .env 自动生成（首次部署零配置） ============
# .env 放在 config 目录下（已通过 volume 映射到宿主机，持久化）
ENV_FILE="${ENV_FILE:-/app/config/.env}"
if [ ! -f "$ENV_FILE" ]; then
  echo "首次部署：$ENV_FILE 不存在，自动生成..."
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  mkdir -p "$(dirname "$ENV_FILE")"
  cat > "$ENV_FILE" <<EOF
# 自动生成于 $(date -u +%Y-%m-%dT%H:%M:%SZ)
# 鉴权密钥（HMAC-SHA256），用于签名登录 cookie
AUTH_SECRET=${SECRET}
EOF
  echo "已生成 AUTH_SECRET 并写入 $ENV_FILE"
fi

# 加载 .env 到环境变量（env_file 可能因 required:false 未加载首次部署的变量）
set -a
. "$ENV_FILE"
set +a

echo "Running Prisma migrations..."
# migrate deploy 无待应用时 exit 0；失败则由 set -e 终止容器启动，避免带着缺失的 schema 静默运行
node ./node_modules/prisma/build/index.js migrate deploy --schema ./prisma/schema.prisma

echo "Starting Next.js standalone API backend on port 3001..."
export PORT=3001
export HOSTNAME=0.0.0.0
node ./server.js &
NEXT_PID=$!

# 等待后端就绪
echo "Waiting for backend..."
for i in $(seq 1 30); do
  if wget --quiet --tries=1 --spider http://127.0.0.1:3001/api/health 2>/dev/null; then
    echo "Backend ready"
    break
  fi
  sleep 1
done

# 启动 nginx（前台运行，作为容器主进程）
echo "Starting nginx on port 3000..."
nginx -g "daemon off;" &
NGINX_PID=$!

# 任一进程退出则退出容器
wait -n $NEXT_PID $NGINX_PID
EXIT_CODE=$?

# 清理
kill $NEXT_PID $NGINX_PID 2>/dev/null || true
exit $EXIT_CODE
