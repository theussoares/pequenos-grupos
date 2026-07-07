/**
 * Mock mínimo da API do Supabase (Auth + PostgREST) para o preview local do app,
 * sem depender de um projeto Supabase real. Serve dados de exemplo e aceita
 * (sem persistir) as mutações. NÃO usar em produção.
 *
 * Env:
 *   MOCK_PORT  porta (padrão 9999)
 *   MOCK_LOG   se definido, loga cada requisição
 */
import http from 'node:http'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.MOCK_PORT ?? 9999)
const LOG = Boolean(process.env.MOCK_LOG)

const UID = '00000000-0000-0000-0000-0000000000aa'
const ANA = '00000000-0000-0000-0000-0000000000ab'
const CARLA = '00000000-0000-0000-0000-0000000000ac'
const PG1 = '11111111-1111-1111-1111-111111111111'
const PG2 = '22222222-2222-2222-2222-222222222222'

const now = Date.now()
const H = 60 * 60 * 1000
const D = 24 * H
const iso = (ms) => new Date(ms).toISOString()
const day = (ms) => new Date(ms).toISOString().slice(0, 10)

const profiles = [
  { id: UID, nome: 'Matheus', telefone: null, role: 'admin', pg_id: null, created_at: iso(now - 90 * D) },
  { id: ANA, nome: 'Ana', telefone: null, role: 'padrinho', pg_id: PG1, created_at: iso(now - 80 * D) },
  { id: CARLA, nome: 'Carla', telefone: null, role: 'lider', pg_id: PG2, created_at: iso(now - 70 * D) }
]

const pgs = [
  { id: PG1, nome: 'PG Central', dia_semana: 4, horario: '19:30:00', endereco: 'Casa do Pedro', lider_id: CARLA, ativo: true, created_at: iso(now - 200 * D) },
  { id: PG2, nome: 'PG Zona Sul', dia_semana: 2, horario: '20:00:00', endereco: null, lider_id: CARLA, ativo: true, created_at: iso(now - 180 * D) }
]

function visitor(id, nome, status, opts = {}) {
  return {
    id, nome,
    telefone: opts.telefone ?? '11988887777',
    idade: opts.idade ?? 20,
    data_primeira_visita: opts.first ?? day(now - 10 * D),
    bairro: opts.bairro ?? 'Centro',
    ponto_referencia: opts.pontoReferencia ?? 'perto do mercado',
    observacoes: null,
    status,
    pg_id: opts.pg ?? PG1,
    padrinho_id: opts.padrinho ?? ANA,
    cadastrado_por: UID,
    proximo_contato_em: opts.deadline ?? null,
    ultimo_contato_em: opts.last ?? iso(now - 2 * D),
    amizade_confirmada: opts.amizade ?? false,
    responsabilidade: opts.resp ?? null,
    status_changed_at: opts.changed ?? iso(now - 3 * D),
    created_at: iso(now - 10 * D),
    updated_at: iso(now - 1 * D)
  }
}

const visitantes = [
  visitor('v1', 'João Pedro', 'novo', { deadline: iso(now - 5 * H), pg: null, padrinho: null, first: day(now - 2 * D), changed: iso(now - 2 * D), telefone: '11999990001', idade: 19 }),
  visitor('v2', 'Maria Clara', 'contatado', { deadline: iso(now + 10 * H), first: day(now - 5 * D), telefone: '11999990002', idade: 22 }),
  visitor('v3', 'Lucas Andrade', 'convidado', { deadline: iso(now + 3 * D), first: day(now - 9 * D), telefone: '11999990003', idade: 20 }),
  visitor('v4', 'Beatriz Souza', 'em_vinculo', { deadline: iso(now - 26 * H), first: day(now - 32 * D), amizade: true, pg: PG2, telefone: '11999990004', idade: 18 }),
  visitor('v5', 'Rafael Lima', 'presente_pg', { first: day(now - 15 * D), telefone: '11999990005', idade: 24 }),
  visitor('v6', 'Julia Santos', 'integrado', { first: day(now - 120 * D), amizade: true, resp: 'Ajuda no lanche', telefone: '11999990006', idade: 21 }),
  visitor('v7', 'Pedro Costa', 'sem_resposta', { first: day(now - 40 * D), telefone: '11999990007', idade: 23 }),
  visitor('v8', 'Larissa Alves', 'reativacao', { deadline: iso(now + 6 * D), first: day(now - 50 * D), telefone: '11999990008', idade: 19 }),
  visitor('v9', 'Gabriel Rocha', 'contatado', { deadline: iso(now - 2 * D), first: day(now - 7 * D), pg: PG2, padrinho: null, telefone: '11999990009', idade: 20 }),
  visitor('v10', 'Amanda Dias', 'novo', { deadline: iso(now + 20 * H), pg: null, padrinho: null, first: day(now - 1 * D), telefone: '11999990010', idade: 18 })
]

const interacoes = [
  { id: 'i1', visitante_id: 'v4', autor_id: UID, tipo: 'mensagem', descricao: null, status_anterior: null, status_novo: null, created_at: iso(now - 30 * D), autor: { nome: 'Matheus' } },
  { id: 'i2', visitante_id: 'v4', autor_id: UID, tipo: 'mudanca_status', descricao: null, status_anterior: 'contatado', status_novo: 'convidado', created_at: iso(now - 28 * D), autor: { nome: 'Matheus' } },
  { id: 'i3', visitante_id: 'v4', autor_id: ANA, tipo: 'presenca_pg', descricao: null, status_anterior: null, status_novo: null, created_at: iso(now - 21 * D), autor: { nome: 'Ana' } },
  { id: 'i4', visitante_id: 'v4', autor_id: ANA, tipo: 'mudanca_status', descricao: null, status_anterior: 'presente_pg', status_novo: 'em_vinculo', created_at: iso(now - 14 * D), autor: { nome: 'Ana' } },
  { id: 'i5', visitante_id: 'v4', autor_id: ANA, tipo: 'nota', descricao: 'Fez amizade com a Julia e o Rafael. Topou ajudar no lanche.', status_anterior: null, status_novo: null, created_at: iso(now - 3 * D), autor: { nome: 'Ana' } }
]

const tables = { profiles, pgs, visitantes, interacoes, presencas_pg: [] }

function applyFilters(rows, params) {
  let out = rows
  for (const [key, raw] of params.entries()) {
    if (['select', 'order', 'limit', 'offset'].includes(key)) continue
    const value = decodeURIComponent(raw)
    if (value.startsWith('eq.')) {
      out = out.filter((r) => String(r[key]) === value.slice(3))
    } else if (value.startsWith('neq.')) {
      out = out.filter((r) => String(r[key]) !== value.slice(4))
    } else if (value.startsWith('in.')) {
      const list = value.slice(4, -1).split(',').map((s) => s.replace(/^"|"$/g, ''))
      out = out.filter((r) => list.includes(String(r[key])))
    }
  }
  return out
}

function applyOrder(rows, params) {
  const order = params.get('order')
  if (!order) return rows
  const [col, ...mods] = order.split('.')
  const desc = mods.includes('desc')
  return [...rows].sort((a, b) => {
    const av = a[col], bv = b[col]
    if (av === null) return 1
    if (bv === null) return -1
    return (av < bv ? -1 : av > bv ? 1 : 0) * (desc ? -1 : 1)
  })
}

// JWT de mock (não assinado de verdade): o identificador vive em `sub`.
const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
const jwt = [
  b64url({ alg: 'HS256', typ: 'JWT' }),
  b64url({ sub: UID, role: 'authenticated', email: 'matheus@igreja.com', exp: Math.floor(now / 1000) + 86400 * 30, aud: 'authenticated', session_id: 'mock-session' }),
  Buffer.from('mock-signature').toString('base64url')
].join('.')

const session = {
  access_token: jwt,
  token_type: 'bearer',
  expires_in: 86400 * 30,
  expires_at: Math.floor(now / 1000) + 86400 * 30,
  refresh_token: 'mock-refresh-token',
  user: {
    id: UID, aud: 'authenticated', role: 'authenticated', email: 'matheus@igreja.com',
    email_confirmed_at: iso(now - 90 * D), phone: '', confirmed_at: iso(now - 90 * D),
    last_sign_in_at: iso(now), app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { nome: 'Matheus' }, identities: [], created_at: iso(now - 90 * D), updated_at: iso(now)
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  if (LOG) console.log(req.method, req.url.slice(0, 130))

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Expose-Headers': '*',
    'Content-Type': 'application/json'
  }
  if (req.method === 'OPTIONS') { res.writeHead(204, headers); return res.end() }

  const send = (code, body) => { res.writeHead(code, headers); res.end(JSON.stringify(body)) }

  if (url.pathname === '/auth/v1/token') return send(200, session)
  if (url.pathname === '/auth/v1/user') return send(200, session.user)
  if (url.pathname === '/auth/v1/logout') return send(204, {})
  if (url.pathname.startsWith('/auth/')) return send(200, {})

  const match = url.pathname.match(/^\/rest\/v1\/(\w+)/)
  if (match) {
    const table = tables[match[1]]
    if (!table) return send(404, { message: 'table not found' })
    if (req.method === 'GET') {
      const rows = applyOrder(applyFilters(table, url.searchParams), url.searchParams)
      const wantsObject = (req.headers.accept || '').includes('pgrst.object')
      if (wantsObject) return rows.length ? send(200, rows[0]) : send(406, { message: 'not found' })
      return send(200, rows)
    }
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      const wantsObject = (req.headers.accept || '').includes('pgrst.object')
      let payload = {}
      try { payload = JSON.parse(body || '{}') } catch { payload = {} }
      if (req.method === 'PATCH') {
        const rows = applyFilters(table, url.searchParams)
        rows.forEach((r) => Object.assign(r, payload))
        return wantsObject && rows.length ? send(200, rows[0]) : send(200, rows)
      }
      // POST: insere de fato na tabela em memória, com defaults de id/timestamps,
      // para refletir corretamente em GETs seguintes (essencial para telas de
      // gestão como /pgs, que recarregam a lista após criar um item).
      const rowsToInsert = Array.isArray(payload) ? payload : [payload]
      const inserted = rowsToInsert.map((row) => {
        const createdAt = row.created_at ?? new Date().toISOString()
        const full = {
          id: row.id ?? randomUUID(),
          created_at: createdAt,
          updated_at: row.updated_at ?? createdAt,
          status_changed_at: row.status_changed_at ?? createdAt,
          ...row
        }
        table.push(full)
        return full
      })
      return wantsObject ? send(201, inserted[0]) : send(201, inserted)
    })
    return
  }
  send(404, { message: 'not found' })
})

server.listen(PORT, () => console.log(`[preview] mock supabase on :${PORT}`))
