/**
 * .env 自动生成与加载（首次部署零配置）。
 *
 * 在 instrumentation.ts（服务端启动钩子）中调用，覆盖所有部署方式：
 * - pnpm dev / pnpm dev:all（本地调试）
 * - pnpm start（生产部署）
 * - Docker（start-spa.sh 已先行处理，此处发现已存在则跳过）
 *
 * .env 位置：config/.env（通过 ENV_FILE 环境变量可覆盖）。
 * 生成后加载到 process.env（不覆盖已有值，environment/env_file 优先）。
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

function parseEnvFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const result: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    result[key] = value
  }
  return result
}

export function ensureEnvFile(): { created: boolean; file: string } {
  const envFile = process.env.ENV_FILE || path.join(process.cwd(), 'config', '.env')

  if (!fs.existsSync(envFile)) {
    const secret = crypto.randomBytes(32).toString('hex')
    const timestamp = new Date().toISOString()
    const dir = path.dirname(envFile)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(
      envFile,
      `# 自动生成于 ${timestamp}\n# 鉴权密钥（HMAC-SHA256），用于签名登录 cookie\nAUTH_SECRET=${secret}\n`,
      'utf-8',
    )
    console.log(`[auto-env] 首次部署：已生成 ${envFile}（含 AUTH_SECRET）`)
    return { created: true, file: envFile }
  }

  return { created: false, file: envFile }
}

export function loadEnvFile(): { loaded: number; file: string } {
  const envFile = process.env.ENV_FILE || path.join(process.cwd(), 'config', '.env')
  if (!fs.existsSync(envFile)) {
    return { loaded: 0, file: envFile }
  }

  const vars = parseEnvFile(envFile)
  let loaded = 0
  for (const [key, value] of Object.entries(vars)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
      loaded++
    }
  }
  return { loaded, file: envFile }
}