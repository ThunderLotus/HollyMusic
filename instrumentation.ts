/**
 * 服务端启动钩子。
 *
 * Docker 入口会先完成 Prisma migration，再启动 Next.js；因此这里的用户初始化
 * 既不会在构建期执行，也不会早于数据库 schema 就绪。
 *
 * 覆盖所有部署方式（pnpm dev / pnpm start / Docker）的 .env 自动生成：
 * 首次启动时自动生成 config/.env（含 AUTH_SECRET），无需手动创建。
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const [{ ensureInitialAdmin, syncUsersFromConfig }, { logger }, { ensureEnvFile, loadEnvFile }] = await Promise.all([
    import('@/lib/config-sync'),
    import('@/lib/logger'),
    import('@/lib/auto-env'),
  ])

  // 首次部署自动生成 config/.env（含 AUTH_SECRET），并加载到 process.env
  const envResult = ensureEnvFile()
  const loadResult = loadEnvFile()
  if (envResult.created || loadResult.loaded > 0) {
    logger.info(`[startup] .env 处理: created=${envResult.created} loaded=${loadResult.loaded} file=${envResult.file}`)
  }

  const syncResult = await syncUsersFromConfig()
  const adminResult = await ensureInitialAdmin()
  logger.info(
    `[startup] 用户初始化完成: imported=${syncResult.imported} initialAdminCreated=${adminResult.created}`,
  )
}
