# Site da Nicolini

Site público da Nicolini, no ar em **https://www.emporionicolini.com.br**
(com `www`). Next.js (App Router), React 19. Repositório GitHub
`nicolini-institucional`, **público**: nada de segredo aqui (o site não tem).

Hoje tem:

- `/` — home (casa, balcões, galeria, Blog).
- `/a-loja` — endereço, horários, contato, fotos, mapa.
- `/bistro` — vitrine do Bistrô.
- `/rustichella` — landing do jantar Bistrô Nicolini × Rustichella d'Abruzzo.
  Fica no site: passa a ser alcançada por "Eventos".
- `/menu/` — cardápio e reservas do Bistrô: app estático em `public/menu`,
  que fala com o Restaurants Engine.

No laboratório (`next dev`) também: `/produtos`, `/produto/<slug>`, `/blog`,
`/eventos`, `/sacola`, `/pedido` e `/politica-de-privacidade`, com dados
simulados no formato do SDK do Engine. No build de produção essas páginas
respondem 404 até a ativação (chaves em `src/menu-do-site.ts`; ver
"Design do site" no `CONTEXTO.md`).

O plano em andamento (blog, eventos, produtos e pedido sem pagamento) está em
`Capilano Suite/plans/nicolini-site/`. **Contexto, regras e limites:**
[`CONTEXTO.md`](CONTEXTO.md).

## Rodar

Tudo a partir desta pasta. A pasta de cima (`Site Nicolini/`) tem um
`package.json` de workspaces que **não** é deste repositório; por isso o
`--workspaces=false` em todo comando npm (a Vercel instala só esta pasta e não precisa dele).

```bash
npm ci --workspaces=false              # instala pelo package-lock.json
npm run dev --workspaces=false         # laboratório: next dev em 0.0.0.0:5183 (abre na rede)
npm run build --workspaces=false       # next build: as páginas saem estáticas
npm test --workspaces=false            # build + teste do contrato de endereços
npm run test:rotas --workspaces=false  # só o teste, sobre o build que já existe
npm run test:pedidos --workspaces=false  # sacola e pedido contra o Engine de staging (bistro-teste)
npm run start --workspaces=false       # next start em 5183, para conferir o build
```

Sem `--workspaces=false`, o npm desta pasta lê os workspaces de `Site Nicolini/`
e falha (os worktrees `institucional-menu-*` repetem o nome do pacote). Para
outra porta, use `./node_modules/.bin/next …` (o `npx` tem o mesmo problema).
Só um `next dev` roda por pasta: o laboratório da 5183 ocupa este checkout.

## Onde fica cada coisa

| O quê | Onde |
| --- | --- |
| Teste do contrato de endereços | `scripts/testar-rotas.mjs` |
| Rotas | `app/` (`(casa)/` com a home, `a-loja/` e as telas novas; `bistro/`, `rustichella/`, `not-found.tsx`, `robots.ts`, `sitemap.ts`) |
| Moldura (header, rodapé, peças travadas) | `src/moldura/`, montada nos `layout.tsx` de rota |
| Módulos acesos, peças de loja e menu | `src/menu-do-site.ts` |
| Dados do Engine (SDK copiado, simulado, fonte) | `src/engine/` |
| Sacola e recibo | `src/sacola/` |
| Peças das telas novas | `src/ui/` |
| Painel do laboratório (só `next dev`) | `src/laboratorio/` |
| Layout raiz, metadados globais e ordem do CSS | `app/layout.tsx` |
| Metadados por página (título, descrição, imagem, canônico) | `src/metadados.ts` |
| Configuração pública (variáveis de ambiente) | `src/site.ts` |
| Redirects, rewrites e cabeçalhos (antes `vercel.json`) | `next.config.ts` |
| Páginas e componentes | `src/paginas/`, `src/components/`, `src/hooks/` |
| Dados locais | `src/data/` |
| CSS por área | `src/styles/` (ordem no `CONTEXTO.md`) |
| Fontes | `src/fonts/` (woff2 + licença OFL), declaradas em `src/styles/fontes.css` |
| Mídia e o app `/menu/` | `public/` (`public/menu` não se edita por aqui) |

## Variáveis de ambiente públicas

Todas têm padrão no código; nenhuma é obrigatória.

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.emporionicolini.com.br` | Origem pública: canônico, sitemap, imagens de compartilhamento |
| `NEXT_PUBLIC_SITE_INDEXAVEL` | ligada | Chave única de indexação. `false` ou `0` põe `noindex` em tudo; o `robots.txt` nunca bloqueia. Só aceita ausente, `true`, `1`, `false`, `0`: outro valor derruba o build |
| `NEXT_PUBLIC_ENGINE_URL` | `https://capilano-restaurant-engines.vercel.app` | Destino do repasse `/menu-engine/...` e, na ativação, das leituras do Blog, Produtos e Pedidos |
| `NEXT_PUBLIC_ENGINE_CASA` | `nicolini` | Chave da casa no Engine (a mesma do `/menu`) |
