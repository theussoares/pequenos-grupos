/**
 * Navega o app (com o mock do Supabase) e captura screenshots das telas
 * principais em mobile e desktop. Requer o app rodando (via preview/run.mjs).
 *
 * Env:
 *   BASE_URL  URL do app (padrão http://localhost:3000)
 *   OUT_DIR   pasta de saída (padrão preview/shots)
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const OUT =
  process.env.OUT_DIR ??
  fileURLToPath(new URL('./shots', import.meta.url))

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: 'pt-BR'
})
const page = await context.newPage()
page.setDefaultTimeout(30000)

async function shot(name) {
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
  console.log('[preview] shot:', name)
}

// 1. Login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await shot('1-login')

// 2. Criar conta (seletor de papel)
await page.getByText('Não tem conta?').click()
await shot('2-criar-conta')
await page.getByText('Já tem conta?').click()

// 3. Entra → Hoje
await page.locator('input[type=email]').fill('matheus@igreja.com')
await page.locator('input[type=password]').fill('senha-preview')
await page.getByRole('button', { name: 'Entrar', exact: true }).click()
await page.waitForURL('**/hoje', { timeout: 20000 })
await page.waitForSelector('text=João Pedro')
await shot('3-hoje')

// 4. Perfil do visitante (timeline rica)
await page.goto(`${BASE}/visitantes/v4`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Beatriz Souza')
await shot('4-perfil-visitante')

// 5. Kanban (mobile)
await page.goto(`${BASE}/kanban`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Funil de assimilação')
await shot('5-kanban-mobile')

// 6. Kanban (desktop)
await page.setViewportSize({ width: 1280, height: 800 })
await page.reload({ waitUntil: 'networkidle' })
await page.waitForSelector('text=Funil de assimilação')
await shot('6-kanban-desktop')
await page.setViewportSize({ width: 390, height: 844 })

// 7. Métricas
await page.goto(`${BASE}/metricas`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Funil do mês')
await shot('7-metricas')

// 8. Recepção (form novo: telefone com máscara, idade 2 dígitos, bairro/PR)
await page.goto(`${BASE}/recepcao`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Cadastro rápido')
await page.locator('input[placeholder="Nome do visitante"]').fill('Teste Preview')
await page.locator('input[inputmode=numeric][type=tel]').fill('11988887777')
await page.locator('input[maxlength="2"]').fill('185')
await page.locator('input[placeholder="Ex.: Centro"]').fill('Centro')
await page
  .locator('input[placeholder="Ex.: perto do mercado"]')
  .fill('perto do mercado')
await shot('8-recepcao')

// 9. Gestão de PGs (lista + designação de líder)
await page.goto(`${BASE}/pgs`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=PG Central')
await shot('9-pgs')

// 10. Gestão de PGs — formulário de novo PG aberto
await page.getByRole('button', { name: 'Novo PG' }).click()
await shot('10-pgs-novo')

await browser.close()
console.log('[preview] done →', OUT)
