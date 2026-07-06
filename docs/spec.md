# spec.md — Funil de Assimilação de Visitantes (Fase 1)

> Gerado na Fase 0 do pipeline. Tier classificado: **🔴 Alta** (nova base de
> dados, novas stores, arquitetura cross-camada, controle de acesso).

## Contexto

App de gestão de pequenos grupos (PG) de uma igreja. O núcleo é um **funil de
assimilação de visitantes**: transformar o cadastro de um visitante em um
pipeline com estágios, responsáveis, prazos (SLA) e métricas, para que nenhum
visitante "suma" por falta de acompanhamento.

Stack: **Nuxt 3 · Vue 3 (Composition API) · TypeScript · Pinia · Tailwind CSS ·
Supabase · Vitest**. Mobile-first, multi-recepcionista.

## Escopo desta entrega (Fase 1 do PDF)

Validar o núcleo: migração do schema, máquina de estados, regras de SLA e as
telas **"Hoje"** e **"Perfil do visitante"**.

### Critérios de aceite mensuráveis

1. **Schema** (§2.3 do PDF) versionado em `supabase/migrations/`: tabelas
   `profiles`, `pgs`, `visitantes`, `interacoes`, `presencas_pg`.
2. **RLS** (§2.4) versionado: admin vê tudo; líder vê apenas visitantes do seu
   PG; padrinho vê apenas afilhados; recepcionista apenas insere.
3. **Máquina de estados** (§2.2) implementada como domínio puro, com transições
   válidas e SLA por status. Transição inválida é rejeitada.
4. **SLA automático** (§2.5): ao entrar em um status, `proximo_contato_em` é
   calculado — `novo` +36h, `contatado` +7d, `convidado` +14d, `reativacao`
   +14d, `em_vinculo` = `data_primeira_visita` +30d; demais sem SLA.
5. **Tela "Hoje"**: fila de próximas ações ordenada por urgência de SLA, com
   badge de atraso, botão de WhatsApp (link `wa.me` com template preenchido) e
   ação de registrar interação.
6. **Tela "Perfil do visitante"**: timeline de interações, dados de contato,
   PG + padrinho (com seletor), presenças, toggle `amizade_confirmada`, campo
   `responsabilidade`, botões de ação rápida (mensagem, presença, nota).
7. **Toda mudança de status/ação gera uma linha em `interacoes`** (histórico).
8. **i18n** pt (padrão) e es em paridade para toda string de UI.
9. Domínio (máquina de estados + SLA) coberto por testes Vitest passando.

### Escopo negativo (NÃO incluído nesta entrega)

- Kanban do funil (Fase 2).
- Telas "Meu afilhado" e "Métricas" (Fase 2/3).
- Jobs diários automáticos: promoção a `integrado`, detecção de `sem_resposta`,
  campanha de reativação em massa (Fase 3).
- Autenticação social / fluxo de convite de usuários (usa Supabase Auth padrão).
- Migração de dados legados / regra do retroativo (Fase 3).

### Impacto em i18n

Novas chaves em `pt` e `es` para: status do visitante, rótulos de SLA, telas
"Hoje" e "Perfil", tipos de interação, botões de ação, templates de mensagem.

### Impacto em stores Pinia

Nova store `useVisitorsStore` (fila do dia + visitante ativo + ações). Nenhuma
store pré-existente (projeto novo).
