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

O plano em andamento (blog, eventos, produtos e pedido sem pagamento) está em
`Capilano Suite/plans/nicolini-site/`. **Contexto, regras e limites:**
[`CONTEXTO.md`](CONTEXTO.md).

## Rodar

Tudo a partir desta pasta. A pasta de cima (`Site Nicolini/`) tem um
`package.json` de workspaces que **não** é deste repositório; por isso o
`--workspaces=false` na instalação (a Vercel instala só esta pasta).

```bash
npm ci --workspaces=false      # instala pelo package-lock.json
npm run dev                    # laboratório: next dev em 0.0.0.0:5183 (abre na rede)
npm run build                  # next build: as páginas saem estáticas
npm run start                  # next start em 5183, para conferir o build
```

Use `./node_modules/.bin/next …` (e não `npx next`) se precisar de outra porta:
o `npx` tenta ler os workspaces da pasta de cima e falha.

## Onde fica cada coisa

| O quê | Onde |
| --- | --- |
| Rotas | `app/` (`page.tsx`, `a-loja/`, `bistro/`, `rustichella/`, `not-found.tsx`, `robots.ts`, `sitemap.ts`) |
| Layout raiz, metadados globais e ordem do CSS | `app/layout.tsx` |
| Metadados por página (título, descrição, imagem, canônico) | `src/metadados.ts` |
| Configuração pública (variáveis de ambiente) | `src/site.ts` |
| Redirects, rewrites e cabeçalhos (antes `vercel.json`) | `next.config.ts` |
| Páginas e componentes (JSX) | `src/paginas/`, `src/components/`, `src/hooks/` |
| Dados locais | `src/data/` |
| CSS por área | `src/styles/` (ordem no `CONTEXTO.md`) |
| Fontes | `src/fonts/` (woff2 + licença OFL), declaradas em `src/styles/fontes.css` |
| Mídia e o app `/menu/` | `public/` (`public/menu` não se edita por aqui) |

## Variáveis de ambiente públicas

Todas têm padrão no código; nenhuma é obrigatória.

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.emporionicolini.com.br` | Origem pública: canônico, sitemap, imagens de compartilhamento |
| `NEXT_PUBLIC_SITE_INDEXAVEL` | ligada | Chave única de indexação. `false` ou `0` põe `noindex` em tudo; o `robots.txt` nunca bloqueia |
| `NEXT_PUBLIC_ENGINE_URL` | `https://capilano-restaurant-engines.vercel.app` | Destino do repasse `/menu-engine/...` |
