# Pequenos Grupos — Funil de Assimilação de Visitantes

App mobile-first para acompanhar visitantes de uma igreja através de um funil de
assimilação com estágios, responsáveis, prazos (SLA) e histórico. Cada visitante
tem um status no funil, um padrinho e um PG (pequeno grupo) designados; o sistema
calcula automaticamente a próxima ação por urgência de SLA.

> Baseado no documento _Funil de Assimilação de Visitantes — Estratégia + Spec
> Técnica_ (Parte 2). Esta entrega cobre a **Fase 1**: schema, máquina de
> estados, regras de SLA e as telas **Hoje** e **Perfil do visitante**.

## Stack

Nuxt 3 · Vue 3 (Composition API) · TypeScript · Pinia · Tailwind CSS · Supabase ·
Vitest · i18n (pt/es).

## Arquitetura

```
camadas/
  core/        utilidades base (datas, erros)
  ui/          componentes de apresentação (dumb) reutilizáveis
  visitantes/  domínio do funil
    domain/       regra pura (máquina de estados, SLA, mappers) — sem Vue/Supabase
    composables/  1 responsabilidade cada (I/O, derivação, ações, apresentação)
    components/   dumb components da feature
    test/         Vitest do domínio e composables
store/          Pinia (useVisitorsStore)
types/          tipos por domínio + contrato do banco
pages/          hoje.vue, visitantes/[id].vue, login, confirm
supabase/migrations/  schema + RLS versionados
```

A regra de negócio vive em `camadas/visitantes/domain/` como funções puras e
testáveis. Componentes nunca fazem I/O nem manipulam a store diretamente — tudo
passa por composables com responsabilidade única. Veja
[`docs/solution-design.md`](docs/solution-design.md) e
[`docs/adr/0001-camadas-e-dominio-puro.md`](docs/adr/0001-camadas-e-dominio-puro.md).

## Como rodar

```bash
npm install
cp .env.example .env   # preencha SUPABASE_URL e SUPABASE_KEY
npm run dev
```

### Banco de dados (Supabase)

Aplique as migrations de `supabase/migrations/` no seu projeto (via Supabase CLI
`supabase db push`, ou colando o SQL no editor do painel, na ordem numérica).
Opcionalmente rode `supabase/seed.sql` para popular PGs e visitantes de exemplo.

### Contas e papéis

A tela de login tem cadastro de conta ("Criar conta"). Ao criar a conta, o
trigger `handle_new_user` (migration 0005) cria automaticamente uma linha em
`profiles` com o papel padrão **`recepcionista`** — por isso o novo usuário já
enxerga a navegação para a Recepção.

Para promover o primeiro **admin** (que vê Hoje, Funil, Métricas e Recepção),
rode uma vez no SQL editor:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'voce@exemplo.com');
```

Papéis disponíveis: `admin` · `lider` · `padrinho` · `recepcionista`.
A navegação e o RLS se ajustam ao papel de cada `profiles.role`.

## Scripts

```bash
npm run dev         # ambiente de desenvolvimento
npm run build       # build de produção
npm run lint        # ESLint
npm run lint:fix    # ESLint com correção
npm run typecheck   # vue-tsc (checagem de tipos)
npm run test:unit   # Vitest (run único)
npm run test        # Vitest (watch)
```

## Regras de negócio (Fase 1)

- **Máquina de estados** (`domain/visitor-status.ts`): 9 status; transições
  inválidas são rejeitadas.
- **SLA** (`domain/sla.ts`): `novo` +36h · `contatado` +7d · `convidado` +14d ·
  `reativacao` +14d · `em_vinculo` = 1ª visita +30d.
- **Transição por presença** (`domain/presence-transition.ts`): registrar
  presença move `convidado → presente_pg` (1ª) e `presente_pg → em_vinculo` (2ª+).
- Toda mudança de status/ação registra uma linha em `interacoes` (timeline).

## Fora de escopo (próximas fases)

Kanban do funil, telas "Meu afilhado" e "Métricas", e os jobs diários
(promoção a `integrado`, detecção de `sem_resposta`, campanha de reativação).
