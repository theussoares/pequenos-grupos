/**
 * Orquestra o preview local: sobe o mock do Supabase, sobe o build de produção
 * apontado para ele, espera ambos ficarem prontos, captura os screenshots e
 * encerra tudo.
 *
 * Pré-requisito: `nuxt build` já executado (o npm script `preview:screens` faz).
 *
 * Env:
 *   APP_PORT   porta do app (padrão 3000)
 *   MOCK_PORT  porta do mock (padrão 9999)
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const APP_PORT = Number(process.env.APP_PORT ?? 3000)
const MOCK_PORT = Number(process.env.MOCK_PORT ?? 9999)
const SERVER_ENTRY = `${ROOT}.output/server/index.mjs`

if (!existsSync(SERVER_ENTRY)) {
  console.error('[preview] build não encontrado. Rode `npm run build` antes.')
  process.exit(1)
}

const children = []
function run(cmd, args, env = {}, stdio = 'ignore') {
  const child = spawn(cmd, args, {
    cwd: ROOT,
    stdio: process.env.MOCK_LOG ? 'inherit' : stdio,
    env: { ...process.env, ...env }
  })
  children.push(child)
  return child
}

function shutdown() {
  for (const child of children) {
    try {
      child.kill('SIGTERM')
    } catch {
      /* já encerrado */
    }
  }
}
process.on('exit', shutdown)
process.on('SIGINT', () => {
  shutdown()
  process.exit(1)
})

async function waitFor(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url)
      if (res.status < 500) return
    } catch {
      /* ainda subindo */
    }
    await sleep(500)
  }
  throw new Error(`[preview] timeout esperando ${url}`)
}

run('node', [`${ROOT}preview/mock-supabase.mjs`], { MOCK_PORT: String(MOCK_PORT) })
run('node', [SERVER_ENTRY], {
  NUXT_PUBLIC_SUPABASE_URL: `http://localhost:${MOCK_PORT}`,
  NUXT_PUBLIC_SUPABASE_KEY: 'mock-anon-key',
  PORT: String(APP_PORT)
})

console.log('[preview] aguardando servidores…')
await waitFor(`http://localhost:${MOCK_PORT}/rest/v1/pgs?select=*`)
await waitFor(`http://localhost:${APP_PORT}/login`)

const shots = run(
  'node',
  [`${ROOT}preview/screenshot.mjs`],
  { BASE_URL: `http://localhost:${APP_PORT}` },
  'inherit'
)

const code = await new Promise((resolve) => shots.on('exit', resolve))
shutdown()
process.exit(code ?? 0)
