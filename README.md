# Catálogo de Profissionais

Aplicação **Nuxt 4 (SSR)** que lista 520 profissionais autônomos com busca, filtros por categoria, ordenação, paginação por *infinite scroll* e página de perfil — servida por uma API Nitro local que lê `data/professionals.json`.

| | |
| --- | --- |
| **Deploy** | https://atlas-frontend-challenge-henrique.vercel.app |
| **Stack** | Nuxt 4 · Vue 3 · TypeScript · Pinia · Tailwind CSS · Nitro · Vitest |
| **Qualidade** | ESLint · Prettier · `vue-tsc` · CI (lint, formatação, tipos, 68 testes e build) |
| **IA** | desenvolvimento assistido por **DeepSeek V4 Flash** → [Uso de IA](#uso-de-ia) |

## Funcionalidades

- **Busca por nome ou profissão**, insensível a caixa e a acento: `tecnico` encontra "Técnico em Edificações", e "joao" encontra "João".
- **Filtros e ordenação na URL** (`?search=`, `?category=`, `?sort=`): todo estado da listagem é compartilhável e sobrevive a *refresh*, voltar/avançar e acesso direto por link.
- **Infinite scroll acessível**, com botão "Carregar mais" como *fallback* quando o `IntersectionObserver` não está disponível.
- **Estados de carregamento, vazio e erro** em cada nível (primeira página, próxima página, perfil), sem *layout shift*.
- **Perfil do profissional** (`/profissionais/:id`) renderizado no servidor, com metadados próprios e **404 HTTP real** para id inexistente.
- **Página de erro customizada** (404/500) com `noindex` e caminho de volta para a listagem.

## Como rodar

Pré-requisitos: **Node** (`.nvmrc` = 24; o `engines` aceita `^22.19.0 || ^24.11.0 || >=26.0.0`) e npm.

```bash
npm ci          # instala as dependências (o postinstall roda `nuxt prepare`)
npm run dev     # http://localhost:3000
```

Build de produção e preview local:

```bash
npm run build
npm run preview
```

### Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção (`.output`) |
| `npm run preview` | serve o build de produção localmente |
| `npm test` / `npm run test:watch` | testes unitários (Vitest) |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run format` / `npm run format:check` | Prettier |
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
test/unit/              # components/ · server/ · stores/ · utils/
```

## Fluxo de dados

```text
página → store (Pinia) → service ($fetch) → API Nitro → data/professionals.json
```

Cada camada tem uma responsabilidade só: a página liga URL ⇄ store ⇄ componentes, o store guarda o estado e as regras de *fetch*, o service é o único lugar que conhece `$fetch`, e a API normaliza a query, filtra, ordena e pagina. A primeira página é renderizada no SSR (`useAsyncData`); o infinite scroll governa apenas as páginas seguintes, no cliente.

## API

### `GET /api/professionals`

| Parâmetro | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `search` | string | — | busca em **nome** e **profissão**, insensível a caixa e a acento |
| `category` | string | — | categoria exata (`app/constants/professional.ts`) |
| `sort` | `price_asc` \| `price_desc` \| `rating` \| `distance` | `rating` | ordenação; valor inválido é ignorado |
| `page` | number | `1` | página (1-based); valor inválido cai no padrão |
| `limit` | number | `20` | itens por página, com teto de `100` |

Resposta: `{ items, total, page, limit, totalPages }`.

```bash
BASE='https://atlas-frontend-challenge-henrique.vercel.app'

curl "$BASE/api/professionals?search=tecnico"     # 9 resultados
curl "$BASE/api/professionals?search=TECNICO"     # 9 (caixa não importa)
curl "$BASE/api/professionals?search=T%C3%A9cnico" # 9 (acento não importa)
curl "$BASE/api/professionals?category=Beleza%20e%20Est%C3%A9tica&sort=price_asc&limit=12"
```

### `GET /api/professionals/:id`

`200` com o profissional, ou `404` com `{ statusCode, statusMessage }`:

```bash
curl "$BASE/api/professionals/pro-0001"      # 200
curl -i "$BASE/api/professionals/nao-existe" # 404
```

> Em desenvolvimento os dois handlers começam com `await simulateApiLatency()` (600 ms) para que os estados de carregamento fiquem visíveis. O guard `import.meta.dev` é resolvido em build time, então o delay **não existe** no artefato de produção (ver [Decisões técnicas](#decisões-técnicas--listagem-de-profissionais)).

## Testes

```bash
npm test      # 68 testes em 9 arquivos (Vitest + happy-dom + @vue/test-utils)
```

| Grupo | Arquivos | O que garante |
| --- | --- | --- |
| `test/unit/components` | `ProfessionalAvatar`, `ProfessionalList` | iniciais, cor determinística e `alt`/`src` do avatar; máquina de estados da lista (erro > carregando > vazio > itens), evento de *retry* e skeletons anexados ao carregar mais |
| `test/unit/composables` | `useListingQuerySync` | URL → store (normalização e URL como fonte da verdade) e store → URL: só um filtro realmente novo faz `replace` + volta ao topo, enquanto uma mudança vinda da própria URL não reescreve nada |
| `test/unit/server` | `professionalsQuery` | **matriz diferencial de acento** (`tecnico` = `TECNICO` = `Técnico`), parsing e *clamp* de `page`/`limit`, ordenação, paginação e não-mutação do dataset — rodando sobre os 520 registros reais |
| `test/unit/stores` | `professionals` | idempotência de *fetch* pela assinatura de filtros, paginação otimista com *rollback* e a semântica **404 vs 500** no `loadById` |
| `test/unit/utils` | `avatar`, `format`, `httpError`, `listingFilters` | URL ⇄ filtros, formatação de preço/nota/distância, iniciais/cores e leitura de `status`/`statusText` de um erro (incluindo o `Error` plano que o store lança) |

A lógica de query da API foi extraída para `server/utils/professionalsQuery.ts` justamente para poder ser testada sem simular um evento HTTP: o handler ficou com 3 linhas.

## CI e qualidade

Pipeline em [`.github/workflows/ci.yml`](.github/workflows/ci.yml): um único job, **`quality`**, que roda `npm ci` → lint → `format:check` → `typecheck` → testes → build e publica o `.output` como artifact (7 dias). Roda a cada push em `main`/`development` e em todo *pull request*, e pushes no mesmo ref cancelam a execução anterior.

O deploy fica inteiramente com o Vercel: a integração Git do repositório publica a produção e os *previews* de pull request. O repositório não tem `vercel.json` nem *Deploy Hook*, e o CI não recebe secret nenhum de deploy.

## SEO e acessibilidade

- `<html lang="pt-BR">`, `title` e `description` globais em `nuxt.config.ts`, sobrescritos por página com `useSeoMeta`.
- Perfil: título e descrição vêm do próprio registro; a listagem é renderizada no SSR, então o HTML já chega com os cards.
- Listagem: título e descrição seguem os filtros (busca/categoria) e o `canonical` aponta sempre para a listagem limpa (`origin + "/"`), então as variantes de faceta (`?search=`, `?category=`, `?sort=`) não são indexadas como páginas duplicadas.
- Erro (404/500): `app/error.vue` define título próprio (sem o sufixo genérico `| Nuxt`), `robots: noindex, nofollow`, `og:`/`twitter:` e **um único `h1`**, além de um link real (`href="/"`) de volta para a listagem — página de erro não deve ser indexada nem virar *soft 404*.
- **Status HTTP correto**: id inexistente devolve **404** de verdade (inclusive no SSR); falha de rede/servidor agora vira **500**, em vez de ser mascarada como "não encontrado". Quem decide isso é o `loadById` do store (que **lança** o erro com `statusCode`/`statusMessage`); a página re-lança o que veio de `useAsyncData` e `app/error.vue` só exibe o que recebeu.
- Acessibilidade: `role="alert"` no erro, `aria-busy`/`aria-label` no carregamento, `aria-hidden` no avatar decorativo, foco visível em todos os controles, `<label>` nos filtros e `alt` com o nome quando existe foto.

## Uso de IA

O desenvolvimento foi assistido por **DeepSeek V4 Flash**, usado como par de programação: proposta de estrutura de componentes, escrita inicial de trechos repetitivos e de testes, revisão de código e depuração (inclusive de detalhes de `IntersectionObserver`, restauração de scroll e normalização de acento na busca). Nada entrou sem leitura, ajuste e validação: lint, formatação, tipos, testes e build rodam em CI a cada push, e o comportamento foi conferido manualmente em produção. As decisões de arquitetura, de UX e os trade-offs documentados em **Decisões técnicas** foram revisados por mim e são defendidos por mim — não são resultado de geração automática sem critério.

## Limitações e próximos passos

- **Fotos:** o dataset não traz imagens (`avatarUrl: null`), então o `ProfessionalAvatar` cai nas iniciais com cor determinística — o ramo que renderiza `<img>` já existe e tem teste. Popular `avatarUrl` em `scripts/generate-data.mjs` basta para trocar por fotos reais.
- **Cache de CDN:** o HTML hoje responde `cache-control: public, max-age=0, must-revalidate`; um `routeRules: { swr: 60 }` no `nuxt.config.ts` serviria a listagem do CDN com revalidação em background.
- **Região das functions:** o SSR roda em `iad1` (EUA). Mover o projeto para `gru1` (São Paulo) reduz o TTFB de quem acessa do Brasil.
- **Testes de integração/E2E:** o próximo passo natural é cobrir os handlers HTTP com `@nuxt/test-utils` (`setup()` + `$fetch`) e um fluxo ponta a ponta (buscar → filtrar → abrir perfil → voltar).
- **Virtualização:** com `content-visibility` a lista de 520 itens já evita layout/paint fora da viewport; para milhares de itens vale avaliar virtualização real.
- **Observabilidade:** Vercel Analytics/Speed Insights seriam o primeiro passo em um cenário de produção.

## Decisões técnicas — listagem de profissionais

### Latência simulada da API (dev only)
O catálogo é servido por uma rota Nitro local lendo `data/professionals.json`, então as respostas voltam em poucos milissegundos e nenhum estado de carregamento chega a aparecer. `server/utils/apiLatency.ts` devolve essa latência à API mockada (600ms por request): os dois handlers (`server/api/professionals.get.ts` e `server/api/professionals/[id].get.ts`) começam com `await simulateApiLatency()`.

- Fica na própria API porque é ela que seria lenta, não o front: service e store seguem idênticos ao que seriam contra um backend real, e o delay vale para listagem, filtros, infinite scroll e detalhe (inclusive o 404).
- **Só em desenvolvimento:** o guard `!import.meta.dev` é resolvido em build time, então no `nuxt build` a condição vira `false` e o Rollup remove a chamada — o artefato final não tem delay algum. Para ajustar ou desligar, mude `API_LATENCY_MS` no helper (em dev o Nitro recarrega o handler ao salvar).
- Em dev o SSR também paga o delay, porque o `$fetch` do Nuxt chama a API em processo (`localFetch` do Nitro), sem HTTP. O HTML continua chegando completo, então o efeito é apenas TTFB maior — e é justamente por isso que o delay não vai para o build.

### Paginação: infinite scroll com fallback acessível
- `app/composables/useInfiniteScroll.ts` — wrapper fino de `IntersectionObserver` (sem dependências novas, no mesmo espírito de `useDebounce`). O observer é ancorado num sentinel (`ref="loadMoreTrigger"`) no fim da lista, com `rootMargin: 0px 0px 600px 0px` para pré-carregar a próxima página antes de o usuário chegar ao fim.
- O `IntersectionObserver` só dispara em *mudanças* de interseção. Quando o conteúdo carregado não preenche a viewport, o sentinel nunca sai da tela e nenhum evento novo é emitido — por isso o composable aceita `watch` (na página, `() => store.items.length`) e **re-observa** o sentinel depois de cada append: `observe()` sempre emite uma entrada inicial, e o `rootMargin` de 600px passa a valer de fato (um `getBoundingClientRect` manual o ignoraria).
- `supported` é `false` no servidor e em browsers sem `IntersectionObserver`; nesse caso o mesmo rodapé mostra o botão "Carregar mais" (`v-show="!infiniteScrollSupported"`), então a paginação nunca fica inalcançável.
- O rodapé reserva `min-h-[44px]` para o estado/botão não provocar layout shift ao aparecer.

### Idempotência de fetch e preservação do scroll
- `store.loadFirstPage({ force })` compara uma assinatura de filtros (`filterKey(listingFiltersOf(store))` → `search|category|sort`) com `appliedSignature`. Filtros iguais ⇒ **nenhuma request** e `items` intactos — é isso que permite voltar de um perfil e encontrar a lista como estava (sem novo fetch e sem skeleton).
- "Voltar para a listagem" (`app/pages/profissionais/[id].vue`) é um `<a href="/">` de verdade, cujo `@click` só chama `preventDefault()` para fazer `router.back()`. Um `push` faz `savedPosition` ser `undefined` e o Nuxt rolar para o topo; o `pop` faz o vue-router fornecer `savedPosition`, que o `scrollBehavior` padrão do Nuxt usa para restaurar a posição. O `router.back()` só é executado quando `history.state.back` é a própria listagem (`/` ou `/?...`): em acesso direto por URL, ou vindo de outro perfil, não há posição para restaurar e o `back` levaria para fora do app — nesses casos o `<a>` segue o `href`. Modificadores (ctrl/cmd/shift/alt) e meio-clique não são interceptados e abrem em nova aba, e o link real também atende crawlers e usuários sem JS.
- Não sobrescrevemos `scrollBehavior`: um `app/router.options.ts` é aplicado **por cima** do default do Nuxt (spread raso), o que exigiria reimplementar `savedPosition`, hash e o tratamento de mesmo-path — custo alto para pouco ganho.
- Trade-off conhecido: o Nuxt mantém o scroll quando só a query muda no mesmo path. Como trocar filtro reconstrói a lista, `app/composables/useListingQuerySync.ts` escreve a query e rola para o topo explicitamente — mas só depois de um filtro realmente mudar, o que deixa a restauração de `savedPosition` (voltar/avançar, carga inicial) intacta.
- Normalização da query: `listingFiltersOf`/`parseListingFilters` são a fronteira onde a busca perde espaços nas bordas, então a URL escrita, a chave de fetch (`filterKey`) e o `search` enviado à API sempre concordam — `?search=ana%20` e `?search=ana` são o mesmo filtro e o watcher não reescreve a URL nesse caso. Efeitos colaterais aceitos: um parâmetro residual (`?search=`, `?sort=rating`, `?category=Inexistente`) não conta como casando e é limpo no primeiro `replace`; e como a URL devolve o valor normalizado, um espaço nas bordas de um filtro que acabou de mudar pode sumir do próprio input (sem mudar o resultado, porque `buildQuery` já enviava o `search` sem esses espaços).

### Erro de "carregar mais" não apaga a lista
`errorFirst` (primeira página) continua substituindo a grade pela mensagem de erro, mas falhas de página seguinte usam `errorNext`, exibido inline no rodapé com "Tentar novamente" — a lista já carregada permanece visível. Um único campo `loading: 'idle' | 'first' | 'next' | 'detail'` guarda o request em voo (exposto como `isLoadingFirst`/`isLoadingNext`), então os guards não podem mais conflitar.

### Cartões: `content-visibility` em vez de virtualização
`app/assets/css/main.css` aplica em `.card-cv`:

```css
content-visibility: auto;
contain-intrinsic-size: auto 260px;
contain: layout paint style;
```

A base é de 520 profissionais com `MAX_LIMIT = 100` e grade responsiva (1→4 colunas). `content-visibility: auto` faz o browser pular layout/paint dos cards fora da viewport — a maior parte do ganho de uma virtualização real, com 3 linhas de CSS e sem os problemas dela (altura desconhecida, acessibilidade, Ctrl+F, `savedPosition` quebrado).

Limitação: cards nunca renderizados usam a altura estimada (260px ≈ altura natural do `ProfessionalCard`), o que pode gerar um pequeno desvio na posição restaurada. O `auto` faz o browser memorizar a altura real de cada card após o primeiro render, então o desvio é pontual e converge conforme a lista é percorrida. Se o dataset crescer para milhares de itens, vale reavaliar virtualização (`useVirtualList` do `@vueuse/core` ou similar) e/ou paginação por URL (`?page=`).

### Outros
- `app/utils/listingFilters.ts` é o único lugar que sabe quais query params descrevem a listagem: `listingFiltersOf` normaliza (o `trim` da busca mora só aqui e no `parse`), `parseListingFilters`/`serializeListingFilters` convertem URL ⇄ filtros, `sameFilters` compara por valor e `filterKey` dá a identidade de fetch usada pelo `appliedSignature` do store. `app/composables/useListingQuerySync.ts` é a ponte store ⇄ URL construída sobre elas. Adicionar um filtro passa a exigir store + util + componente do filtro, em vez de 6 edições espalhadas na página.
- `v-memo="[professional.id]"` nos cards evita re-render dos itens inalterados quando a lista cresce.
- Os skeletons de "carregar mais" são **anexados** ao grid (4 cartões) em vez de trocar a grade inteira, evitando CLS e mantendo o conteúdo já lido na tela.
- **A ordem importa em `app/pages/index.vue`:** `useInfiniteScroll` e `useListingQuerySync` (que registra o `watch` store → URL) são chamados *antes* do `await useAsyncData(...)`. Depois de um `await` no `setup()`, o Vue perde o contexto da instância e hooks registrados em seguida são descartados silenciosamente — o observer nunca iniciaria e os watchers nunca seriam limpos no unmount. O composable emite um aviso em dev caso seja chamado nesse estado.
- Botão "Voltar ao topo" aparece a partir de 40 itens carregados.
- A primeira página continua renderizada no SSR (`useAsyncData`), preservando SEO; o infinite scroll só governa as páginas seguintes, no cliente.
