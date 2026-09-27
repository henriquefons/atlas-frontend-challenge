# Catálogo de Profissionais

Aplicação **Nuxt 4 (SSR)** que lista 520 profissionais autônomos com busca, filtros por categoria, ordenação, paginação por *infinite scroll* e página de perfil — servida por uma API Nitro local que lê `data/professionals.json`.

| | |
| --- | --- |
| **Deploy** | https://atlas-frontend-challenge-henrique.vercel.app |
| **Stack** | Nuxt 4 · Vue 3 · TypeScript · Pinia · Tailwind CSS · Nitro · Vitest |
| **Qualidade** | ESLint · Prettier · `vue-tsc` · CI (lint, formatação, tipos, 71 testes e build) |
| **IA** | desenvolvimento assistido por **DeepSeek V4 Flash** → [Uso de IA](#uso-de-ia) |

## Funcionalidades

- **Busca por nome ou profissão**, insensível a caixa e a acento: `tecnico` encontra "Suporte Técnico", e "joao" encontra "João".
- **Filtros e ordenação na URL** (`?search=`, `?category=`, `?sort=`): o estado da listagem é compartilhável e sobrevive a *refresh*, voltar/avançar e link direto.
- **Infinite scroll acessível**, com botão "Carregar mais" como *fallback* quando o `IntersectionObserver` não está disponível, e "Voltar ao topo" a partir de 40 itens.
- **Perfil do profissional** (`/profissionais/:id`) renderizado no servidor, com metadados próprios e **404 HTTP real** para id inexistente.
- **Estados de carregamento, vazio e erro** em cada nível (primeira página, próxima página, perfil), sem *layout shift*, mais uma página de erro customizada (404/500) com `noindex`.

## Como rodar

Pré-requisitos: **Node** (`.nvmrc` = 24; o `engines` aceita `^22.19.0 || ^24.11.0 || >=26.0.0`) e npm.

```bash
npm ci          # instala as dependências (o postinstall roda `nuxt prepare`)
npm run dev     # http://localhost:3000
```

Outros scripts:

| Comando | Descrição |
| --- | --- |
| `npm run build` / `npm run preview` | build de produção (`.output`) e preview local |
| `npm test` / `npm run test:watch` | testes unitários (Vitest) |
| `npm run lint` / `npm run format:check` | ESLint e Prettier (`lint:fix` e `format` corrigem) |
| `npm run typecheck` | `vue-tsc` sobre o app e sobre os testes |
| `npm run generate:data` | regenera `data/professionals.json` (faker com seed fixa → saída determinística) |

## Estrutura

```text
app/
├── components/
│   ├── professional/   # card, lista, filtros, avatar, cabeçalho do perfil, serviços, disponibilidade
│   └── ui/             # primitivas: BaseButton, BaseInput, BaseSelect, BaseBadge, BaseSkeleton
├── composables/        # useDebounce · useInfiniteScroll · useListingQuerySync
├── constants/          # categorias, opções de ordenação, limites de paginação
├── pages/              # index.vue (listagem) · profissionais/[id].vue (perfil)
├── services/           # única camada que fala HTTP ($fetch)
├── stores/             # Pinia: estado da listagem + do perfil
├── utils/              # avatar · format · listingFilters · httpError
└── error.vue           # página de erro global (404/500)
server/
├── api/                # GET /api/professionals · GET /api/professionals/:id
└── utils/              # normalizeText · professionalsQuery · apiLatency
data/professionals.json # 520 registros (gerados por scripts/generate-data.mjs)
test/unit/              # components/ · composables/ · server/ · stores/ · utils/
```

## Fluxo de dados

```text
página → store (Pinia) → service ($fetch) → API Nitro → data/professionals.json
```

Cada camada tem uma responsabilidade só: a página liga URL ⇄ store ⇄ componentes, o store guarda o estado e as regras de *fetch*, o service é o único lugar que conhece `$fetch`, e a API normaliza a query, filtra, ordena e pagina.

## API

### `GET /api/professionals`

| Parâmetro | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `search` | string | — | busca em **nome** e **profissão**, insensível a caixa e a acento |
| `category` | string | — | categoria exata (`app/constants/professional.ts`) |
| `sort` | `price_asc` \| `price_desc` \| `rating` \| `distance` | `rating` | ordenação; valor inválido é ignorado |
| `page` | number | `1` | página (1-based); valor inválido cai no padrão |
| `limit` | number | `20` | itens por página, com teto de `100` |

Resposta: `{ items, total, page, limit, totalPages }`. `GET /api/professionals/:id` devolve `200` com o profissional ou `404` com `{ statusCode, statusMessage }`.

```bash
BASE='https://atlas-frontend-challenge-henrique.vercel.app'   # ou http://localhost:3000

# listagem — na busca, caixa e acento não importam
curl "$BASE/api/professionals?search=tecnico"                 # 14 resultados
curl "$BASE/api/professionals?category=Beleza%20e%20Est%C3%A9tica&sort=price_asc&limit=12"

# detalhe
curl "$BASE/api/professionals/pro-0001"                       # 200
curl -i "$BASE/api/professionals/nao-existe"                  # 404
```

> Em dev os dois handlers começam com `await simulateApiLatency()` (600 ms) para que os estados de carregamento fiquem visíveis; o guard `import.meta.dev` é resolvido em build time, então o artefato de produção não tem delay algum.

## CI e qualidade

Pipeline em [`.github/workflows/ci.yml`](.github/workflows/ci.yml): um único job, **`quality`** (`lint, format, types, tests and build`) — `npm ci` → lint → `format:check` → `typecheck` → testes → build, com o `.output` publicado como artifact (7 dias). Roda a cada push em `main`/`development` e em todo *pull request*; pushes no mesmo ref cancelam a execução anterior.

O deploy é inteiramente do Vercel (integração Git: produção e *preview* por pull request) — o CI não tem job de deploy nem recebe *secrets*.

## SEO e acessibilidade

- `<html lang="pt-BR">`, `title` e `description` globais em `nuxt.config.ts`, sobrescritos por página com `useSeoMeta`: o perfil usa o próprio registro e, como a listagem é renderizada no SSR, o HTML já chega com os cards.
- Listagem: título e descrição seguem os filtros (busca/categoria) e o `canonical` aponta sempre para a listagem limpa (`origin + "/"`), então as variantes de faceta (`?search=`, `?category=`, `?sort=`) não são indexadas como páginas duplicadas.
- Erro (404/500): `app/error.vue` define título próprio (sem o sufixo genérico `| Nuxt`), `robots: noindex, nofollow`, `og:`/`twitter:` e **um único `h1`**, além de um link real (`href="/"`) de volta para a listagem — página de erro não deve ser indexada nem virar *soft 404*.
- **Status HTTP correto:** id inexistente devolve **404** de verdade (inclusive no SSR) e falha de rede/servidor vira **500**, em vez de ser mascarada como "não encontrado". O `loadById` do store lança o erro com `statusCode`/`statusMessage` e `app/error.vue` só exibe o que recebeu.
- Acessibilidade: `role="alert"` no erro, `aria-busy`/`aria-label` no carregamento, `aria-hidden` no avatar decorativo, foco visível em todos os controles, `<label>` nos filtros e `alt` com o nome quando existe foto.

## Uso de IA

O desenvolvimento foi assistido por **DeepSeek V4 Flash** como par de programação: estrutura de componentes, primeiros rascunhos de código repetitivo e de testes, revisão e depuração (incluindo `IntersectionObserver`, restauração de scroll e normalização de acento na busca). Nada entrou sem leitura, ajuste e validação — lint, formatação, tipos e 71 testes rodam em CI a cada push — e as decisões de arquitetura e de UX documentadas aqui foram revisadas e são defendidas por mim.

## Limitações e próximos passos

- **Fotos:** são de demonstração — 24 retratos *hotlinkados* do CDN da Unsplash (`images.unsplash.com`, sem chave de API e sem arquivo no repositório), repetidos entre os 520 registros e sem relação com o nome da pessoa; em produção viriam de upload real, com storage e moderação.
- **Cache de CDN:** o HTML responde `cache-control: public, max-age=0, must-revalidate`; um `routeRules: { swr: 60 }` no `nuxt.config.ts` serviria a listagem do CDN com revalidação em background.
- **Região das functions:** o SSR roda em `iad1` (EUA). Mover o projeto para `gru1` (São Paulo) reduz o TTFB de quem acessa do Brasil.
- **Testes de integração/E2E:** o próximo passo natural é cobrir os handlers HTTP com `@nuxt/test-utils` (`setup()` + `$fetch`) e um fluxo ponta a ponta (buscar → filtrar → abrir perfil → voltar).

## Decisões técnicas — listagem de profissionais

O porquê das escolhas que mudam comportamento; o detalhe fino mora nos comentários dos arquivos citados e nos testes.

- **Infinite scroll** (`app/composables/useInfiniteScroll.ts`): wrapper fino de `IntersectionObserver` ancorado num sentinel no fim da lista, com `rootMargin` de 600 px. Como o observer só dispara em *mudanças*, o sentinel é re-observado após cada append (`observe()` sempre emite uma entrada inicial); sem suporte, o mesmo rodapé mostra "Carregar mais".
- **Voltar e scroll** (`app/pages/profissionais/[id].vue`): "Voltar para a listagem" é um `<a href="/">` real cujo `@click` só faz `preventDefault()` + `router.back()`, e só quando `history.state.back` é a listagem — é isso que preserva o `savedPosition`. Não sobrescrevemos `scrollBehavior` porque um `app/router.options.ts` é aplicado **por cima** do default do Nuxt (spread raso), exigindo reimplementar `savedPosition`, hash e mesmo-path.
- **Idempotência** (`app/stores/professionals.ts`): `loadFirstPage({ force })` compara `filterKey(listingFiltersOf(store))` com `appliedSignature` — filtros iguais significam **nenhuma request** e `items` intactos, o que permite voltar de um perfil e reencontrar a lista como estava; uma troca real de filtro reconstrói a lista do topo antes de escrever a URL.
- **Cartões** (`app/assets/css/main.css`, `.card-cv`): `content-visibility: auto` + `contain-intrinsic-size` no lugar de virtualização — o mesmo ganho de layout/paint sem quebrar Ctrl+F ou `savedPosition`. Limitação: cards nunca renderizados usam a altura estimada (260 px), então a posição restaurada pode sofrer um desvio pontual.
- **Render incremental** (`ProfessionalList.vue`): `v-memo="[professional.id]"` evita re-render dos itens inalterados, e os skeletons de "carregar mais" são **anexados** ao grid (4 cartões) em vez de trocar a grade inteira — sem CLS.
- **Fonte única dos filtros** (`app/utils/listingFilters.ts`): é o único lugar que conhece os query params — normalização do `search`, `parse`/`serialize`, `sameFilters` e `filterKey` (a identidade de fetch do store); `useListingQuerySync` é a ponte store ⇄ URL sobre elas. Adicionar um filtro exige store + util + componente, e o handler da API ficou com 3 linhas porque a query foi para `server/utils/professionalsQuery.ts`.

- **Avatar com fallback** (`scripts/generate-data.mjs`, `ProfessionalAvatar.vue`): a foto sai de `faker.helpers.arrayElement([...validUrls, ...BROKEN_AVATAR_URLS])`: 24 retratos do Unsplash (11 femininos, 13 masculinos) mais 3 URLs quebradas de propósito; como o sorteio consome a stream do faker, o catálogo só segue reproduzível enquanto o seed (42) e a ordem das chamadas não mudarem, então `npm run generate:data` é um passo determinístico. Cerca de 21% dos registros apontam para uma URL quebrada (404, caminho errado e host inexistente) e o `@error` do `<img>` cai nas iniciais — o fallback é exercitado pelos dados reais, não só pelo teste. Como fotos *above the fold* são `eager`, o navegador pode disparar o `error` **antes da hidratação**, quando o Vue ainda não anexou o listener (o evento se perde e a `<img>` quebrada fica presa): um `onMounted` relê o DOM (`complete` + `naturalWidth === 0`) e reconcilia esse caso, sem disparar downloads extras. O `<img>` também reserva o quadrado (`width`/`height`) contra CLS e carrega `lazy` fora do cabeçalho do perfil e `eager` nele.
