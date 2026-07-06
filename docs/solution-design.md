# solution-design.md — Fase 1

> Gerado na Fase 1 do pipeline (Arquiteto + CTO).

## Princípios

- **SOLID / Clean Code / DRY.** Regra de negócio (máquina de estados + SLA) vive
  em um **domínio puro**, sem dependência de Vue/Nuxt/Supabase — testável em
  isolamento.
- **Dumb Components.** Nenhum componente contém `$fetch`/`useFetch`/
  `useAsyncData` nem manipula store diretamente. Toda I/O e lógica vivem em
  composables com responsabilidade única (SRP).
- **Camadas.** Cada domínio em `camadas/`, espelhando a estrutura do projeto de
  referência.

## Estrutura de camadas

```
camadas/
  core/        ← utilidades base (datas), tipos base, sem regra de negócio
  ui/          ← componentes de apresentação compartilhados (dumb)
  visitantes/  ← domínio do funil de assimilação
    domain/       ← regra pura: visitor-status.ts, sla.ts (sem Vue/Supabase)
    composables/  ← 1 responsabilidade cada (fetch, ações, timeline, whatsapp)
    components/   ← dumb components da feature
    test/         ← Vitest do domínio e composables
store/          ← Pinia: useVisitorsStore
types/          ← tipos por domínio + database.ts (contrato Supabase)
pages/          ← hoje.vue, visitantes/[id].vue, login, index
supabase/migrations/ ← schema + RLS + triggers versionados
```

## Contratos de tipos (TypeScript)

- `VisitorStatus` — union das 9 fases do funil.
- `Visitor`, `Pg`, `Profile`, `Interaction`, `PgPresence` — em `types/`.
- `TodayAction` — item derivado da fila "Hoje" (visitante + deadline + urgência).
- `Database` — contrato das tabelas Supabase em `types/database.ts`.

## Domínio puro (coração da regra de negócio)

- `camadas/visitantes/domain/visitor-status.ts`
  - `VISITOR_STATUSES`, `STATUS_TRANSITIONS`, `canTransition(from, to)`,
    `allowedTransitions(from)`.
- `camadas/visitantes/domain/sla.ts`
  - `computeNextContactDeadline({ status, enteredAt, firstVisitDate })`
  - `slaUrgency(deadline, now)` → `overdue | due-soon | on-track | none`.

Funções puras, sem efeitos colaterais, cada uma < 20 linhas. Autoridade única da
regra de SLA fica no TS (opção "camada Nuxt" do §2.5); o SQL guarda schema/RLS e
um trigger de `updated_at`.

## Composables (SRP — um por responsabilidade)

| Composable            | Responsabilidade única                                  |
| --------------------- | ------------------------------------------------------- |
| `useVisitorsRepository` | Acesso a dados Supabase (fetch/insert/update) — só I/O |
| `useTodayQueue`       | Deriva e ordena a fila "Hoje" por urgência de SLA        |
| `useVisitorProfile`   | Carrega um visitante + relações para a tela de perfil    |
| `useVisitorTimeline`  | Carrega e formata as interações do visitante             |
| `useVisitorActions`   | Executa ações (avançar status, registrar interação…)     |
| `useWhatsappLink`     | Monta link `wa.me` com template i18n preenchido          |

Composables se compõem (`useVisitorActions` usa `useVisitorsRepository`). Nenhum
mistura fetch + transformação + estado de UI no mesmo arquivo.

## Store Pinia

`useVisitorsStore` (padrão `defineStore('visitors', { state, getters, actions })`):
guarda a fila do dia e o visitante ativo; getters derivam contagens; actions
delegam a I/O para o repositório (nunca `$fetch` inline).

## Telas

- `pages/hoje.vue` — consome `useTodayQueue`; renderiza `TodayActionCard`.
- `pages/visitantes/[id].vue` — consome `useVisitorProfile` + `useVisitorTimeline`
  + `useVisitorActions`; compõe `VisitorContactInfo`, `VisitorTimeline`,
  `VisitorQuickActions`.

## i18n

Chaves em `i18n/locales/pt.json` e `es.json`, sempre em paridade. Nenhuma string
hardcoded nos templates.

## Máquina de estados (contrato)

```
novo        → contatado | arquivado                 (SLA 36h)
contatado   → convidado | arquivado                 (SLA 7d)
convidado   → presente_pg | sem_resposta            (SLA 14d)
presente_pg → em_vinculo | sem_resposta             (—)
em_vinculo  → integrado | sem_resposta              (checkpoint dia 30)
integrado   → (final)                               (—)
sem_resposta→ reativacao | arquivado                (—)
reativacao  → contatado | arquivado                 (SLA 14d)
arquivado   → reativacao                            (—)
```
