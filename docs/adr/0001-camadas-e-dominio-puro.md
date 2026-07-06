# ADR 0001 — Arquitetura em camadas com domínio puro

## Status

Aceito.

## Contexto

O funil de assimilação tem regras de negócio não triviais (máquina de estados +
cálculo de SLA) que precisam ser corretas, testáveis e independentes de
infraestrutura (Nuxt/Supabase). O projeto de referência organiza domínios em
`camadas/` e proíbe lógica de negócio dentro de componentes.

## Decisão

1. Cada domínio vive em `camadas/<dominio>`. A feature do funil fica em
   `camadas/visitantes`.
2. A regra de negócio (transições de status e SLA) fica em
   `camadas/visitantes/domain/` como **funções puras**, sem importar Vue, Nuxt
   ou Supabase.
3. Componentes são **dumb**: sem `$fetch`/`useFetch`/`useAsyncData` nem
   manipulação direta de store. Toda I/O e lógica ficam em composables com
   responsabilidade única (SRP).
4. A autoridade da regra de SLA fica no TypeScript (opção "camada Nuxt" do §2.5
   do PDF). O banco guarda schema, RLS e um trigger de `updated_at`.

## Consequências

- **+** Regra de negócio testável em isolamento com Vitest, sem mock de rede.
- **+** Componentes reutilizáveis e previsíveis; troca de backend não afeta o
  domínio.
- **−** Necessário disciplina para não vazar I/O para o domínio puro (garantido
  por: domínio não importa nada de Nuxt/Supabase).
