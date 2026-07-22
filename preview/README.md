# Preview local (sem Supabase real)

Sobe o build de produção do app apontado para um **mock da API do Supabase**
(auth + PostgREST com dados de exemplo) e captura screenshots das telas
principais em mobile e desktop. Útil para revisar visualmente as telas sem
depender de um projeto Supabase configurado.

> ⚠️ Apenas para desenvolvimento. O mock não valida token, não persiste
> mutações e serve dados fixos — nunca usar em produção.

## Uso

```bash
npm run preview:screens
```

Isso faz `nuxt build` e roda `preview/run.mjs`, que:

1. sobe `preview/mock-supabase.mjs` (porta 9999);
2. sobe o app (`.output/server`) com `NUXT_PUBLIC_SUPABASE_URL` apontando pro mock;
3. espera ambos ficarem prontos;
4. roda `preview/screenshot.mjs` (Playwright/Chromium);
5. encerra tudo.

As imagens saem em `preview/shots/` (fora do git).

### Rodar as partes separadamente

```bash
# terminal 1 — mock
node preview/mock-supabase.mjs

# terminal 2 — app já buildado, apontando pro mock
NUXT_PUBLIC_SUPABASE_URL=http://localhost:9999 \
NUXT_PUBLIC_SUPABASE_KEY=mock node .output/server/index.mjs

# terminal 3 — screenshots (ou só navegue no browser em http://localhost:3000)
node preview/screenshot.mjs
```

Para navegar manualmente no preview, abra `http://localhost:3000` — o login
aceita qualquer e-mail/senha (o mock sempre devolve a sessão do perfil
escolhido em `MOCK_USER`, admin por padrão).

### Ver a UI por papel

```bash
MOCK_USER=lider node preview/mock-supabase.mjs      # sessão da Carla (líder)
MOCK_USER=padrinho node preview/mock-supabase.mjs   # sessão da Ana (padrinho)
```

## Variáveis de ambiente

| Var         | Onde            | Padrão                  |
| ----------- | --------------- | ------------------------ |
| `APP_PORT`  | run.mjs         | `3000`                  |
| `MOCK_PORT` | mock/run.mjs    | `9999`                  |
| `MOCK_USER` | mock            | `admin` (ou `padrinho`, `lider`) |
| `BASE_URL`  | screenshot.mjs  | `http://localhost:3000` |
| `OUT_DIR`   | screenshot.mjs  | `preview/shots`         |
| `MOCK_LOG`  | run/mock        | (desligado)             |

## Requisitos

- `playwright` (devDependency). Em uma máquina nova, instale o navegador:
  `npx playwright install chromium`.

## Dados de exemplo

Definidos em `preview/mock-supabase.mjs`: 10 visitantes cobrindo todos os status
do funil, 2 PGs, 3 profiles (admin/líder/padrinho) e uma timeline de interações.
Edite ali para simular outros cenários.
