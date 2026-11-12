# Contexto — Site da Nicolini (institucional)

## Estado em 11/11/2026 — vale sobre o histórico abaixo

- **No ar:** `https://www.emporionicolini.com.br` (com `www`). O domínio
  `nicolinigastronomia.com`, citado no histórico, não é o do site.
- **Repositório:** GitHub `nicolini-institucional`, **público**. Nada de segredo
  aqui; o site não tem segredo.
- **Next.js (App Router), React 19**, desde a branch `nicolini/site-novo`
  (antes Vite + React Router). Troca de casca, não reescrita: páginas,
  componentes, dados, classes e valores de CSS, mídia e `/menu/` ficaram iguais.
  As quatro páginas são estáticas (nenhuma função por visita).
- **Escopo autorizado mudou:** o plano em
  `Capilano Suite/plans/nicolini-site/` (SPEC, SPEC-SITE) autoriza blog,
  eventos, catálogo de produtos e pedido enviado pelo WhatsApp, **sem
  pagamento**, com dados e regras no Restaurants Engine. Pagamento, checkout,
  estoque, frete e conta de cliente continuam fora.
- **`/rustichella` fica no site** (o evento de outubro passou, mas a landing
  vira um evento dentro de "Eventos"). `/bistro/rustichella` redireciona para ela.
- Como rodar, onde fica cada coisa e as variáveis públicas: [`README.md`](README.md).

### Rotas e o que não pode quebrar (`next.config.ts`)

| Endereço | Resposta |
| --- | --- |
| `/menu/` | 200 com o app de `public/menu` (rewrite para `/menu/index.html`), **sem redirect**: o app usa `./css` e `./js` relativos |
| `/menu` | 308 → `/menu/` |
| `/menu-engine/api/v1/public/restaurants/nicolini` | repassado ao Engine (`NEXT_PUBLIC_ENGINE_URL`) |
| `/bistro/reservas` | 307 → `/menu/#/reserva` |
| `/bistro/menu` | 307 → `/menu/` |
| `/bistro/rustichella` | 308 → `/rustichella` |
| `/rustichella.html` (impresso, bio) | 308 → `/rustichella` |
| `/index.html` | 308 → `/` |
| `/Rustichella`, `/Bistro`, `/A-Loja`, `/Menu` (qualquer outra caixa) | 308 → o endereço em minúsculas (`/menu/` com a barra) |
| qualquer página com barra final (exceto `/menu/`) | 308 → sem a barra (nenhuma página com dois endereços). Caminho que começa com `//` ou `/\` não casa: seria redirect para fora do site |
| endereço inexistente | 404 de verdade (`app/not-found.tsx`); antes caía na home |

O redirect automático de barra do Next está desligado
(`skipTrailingSlashRedirect`) e o site faz os seus em `redirects()`, que na
Vercel viram regra de roteamento, não função. `public/menu` não se edita para
"consertar" barra. As regras são sensíveis à caixa
(`experimental.caseSensitiveRoutes`): sem isso o Next as casa sem diferenciar
maiúsculas, e `/Rustichella → /rustichella` viraria laço.

**Teste do contrato:** `npm test --workspaces=false` (build + teste) ou, com
build pronto, `npm run test:rotas --workspaces=false`
(`scripts/testar-rotas.mjs`, Node puro). Sobe `next start` numa porta livre,
confere esta tabela, os cabeçalhos, o `robots.txt` e o `sitemap.xml`, e
encerra. Mudou um endereço, mude a tabela e o teste juntos.

### Cabeçalhos e indexação

- Em todas as respostas: `X-Content-Type-Options: nosniff` e
  `Referrer-Policy: strict-origin-when-cross-origin`.
- Em build de produção (prévia, produção, `next start`):
  `Content-Security-Policy: frame-ancestors 'self'
  https://capilano-restaurant-engines.vercel.app
  https://gestao.capilanocreative.com http://127.0.0.1:3200
  http://localhost:3200 http://127.0.0.1:3299 http://localhost:3299`: o
  visualizador de sites do painel do Engine (endereço atual, o futuro
  `gestao.`, decisão de Pedro, e os laboratórios do painel, que embutem as
  prévias). No laboratório (`next dev`) não há restrição de quadros.
- Laboratório fora de `localhost`: `allowedDevOrigins` libera `127.0.0.1` e as
  faixas de rede local (`192.168.*.*`, `10.*.*.*`, `172.16–31.*.*`). Sem isso o
  `next dev` recusa os recursos de desenvolvimento e a página não hidrata no
  celular pelo Wi-Fi. O `next dev` recarrega sozinho quando o `next.config.ts`
  muda.
- Chave única `NEXT_PUBLIC_SITE_INDEXAVEL` (padrão: ligada, como sempre foi).
  Aceita só ausente, `true`, `1`, `false` ou `0`; outro valor derruba o build.
  Desligada: `<meta name="robots" content="noindex">` em todas as páginas e
  `X-Robots-Tag: noindex` em todas as respostas. O `robots.txt` nunca bloqueia
  a leitura; ligado, aponta o `sitemap.xml` (hoje só as quatro páginas fixas).
- Canônico em cada página, a partir de `NEXT_PUBLIC_SITE_URL`.
- O layout raiz **não chama o Engine** (SPEC-SITE §1.6). O header ainda é o de
  antes; o redesenho é a próxima trilha (design).

### Publicação da migração

- Sobem junto com a migração as mudanças de CSS, paralaxe e fichas dos
  convidados da Rustichella que já estavam na branch antes dela (commits
  `0d15290` e `6ed4c87`; o texto de exemplo ficou guardado em
  `nicolini/guardado-11-11` e não sobe).
- O `vercel.json` desta branch fixa `"framework": "nextjs"`. **Não troque o
  preset do projeto na Vercel** (hoje Vite) enquanto existirem as branches
  `claude/menu-v2` e `claude/menu-staging`: elas são Vite, sem `framework` no
  `vercel.json`, e passariam a falhar.
- As prévias do projeto exigem login da Vercel (proteção de deployment).

### CSS por área (`src/styles/`)

O antigo `src/styles.css` (2.894 linhas) foi recortado, sem mudar classe nem
valor. Os arquivos são importados em `app/layout.tsx` **nesta ordem, que é a
cascata** (a ordem do conteúdo no arquivo antigo). Cada um começa com uma
linha de comentário que diz de quais linhas veio; sem ela, a concatenação na
ordem abaixo é igual ao arquivo original.

1. `fontes.css` — `@font-face` das fontes servidas pelo site (novo; não fazia parte do `styles.css`)
2. `base.css` — tokens (`:root`), reset, tipografia, utilitários
3. `moldura-cabecalho.css` — header e navegação
4. `home.css` — hero, ritmo de seção, A casa, fotos da casa, balcões, blog (hero, ritmo, fotos e balcões também servem às outras páginas)
5. `moldura-rodape.css` — rodapé
6. `loja.css` — `/a-loja`
7. `responsivo.css` — media queries e movimento reduzido de tudo acima
8. `bistro.css` — tema `tema--bistro` e `/bistro`
9. `moldura-whatsapp.css` — botão flutuante do WhatsApp
10. `rustichella.css` — tema `tema--rustichella` e `/rustichella`

Áreas novas entram **no fim**, cada uma com arquivo próprio, criado pela
trilha que a fizer: `blog.css`, `produtos.css`, `pedido.css` (sacola e recibo).
Assim as trilhas paralelas não editam o mesmo arquivo.

### Fontes

Instrument Sans (normal 400–700, itálico 400–600) e Playfair Display (normal e
itálico 500–600), as mesmas famílias e faixas do antigo pedido ao Google, agora
em `src/fonts/` (woff2 variáveis de `@fontsource-variable` 5.3.0, latin e
latin-ext, licença OFL ao lado). Nenhuma das quatro páginas pede nada a
`fonts.googleapis.com`/`fonts.gstatic.com`; quem ainda pede é o iframe do mapa
do Google e o app `/menu/` (fora desta troca).

## Histórico

**21/09/2026 — Reservas R2 publicadas e validadas** (código `5527fa3`,
deployment `dpl_8LHm4g1U7XVpdxHKhcJ9YEPixYW6`). Evidências e operação em
`Capilano Engines/restaurantes/docs/STATUS.md`.

**13/10/2026 — Skin de reservas publicada:** código
`ae7509ac3d47c3cd18b48408e7ce5d1ed102e0ab`, deployment
`dpl_FVf2ZeSsU4ndpVP4a7LaMuePPh5D` READY. `/menu/` e `/menu/js/app.js`
responderam HTTP 200 e servem o campo WhatsApp obrigatório, orientação de DDD ou
+código do país e validação sintática igual à do Engine. O request preserva
`phone.trim()`. O e-mail opcional da Nicolini foi habilitado no backend;
reservas online seguem desativadas, sem janelas reais, em modo manual com
chegadas 19:30/21:00. A skin espelha a fonte do web app. Playwright com API
simulada local passou em desktop/mobile: entradas inválidas, contatos
brasileiro/internacional, e-mail vazio/preenchido/oculto, recibo pendente e gestão
pelo link privado. Build passou em exportação de `main` com a skin, excluindo
alterações concorrentes de Rustichella/Bistrô/CSS. O Engine passou em dois testes
de navegador na produção (fluxo manual e falha de catálogo), usando restaurantes
fictícios próprios, arquivados ao final. Envio de convites e upload aguardam credenciais; push no aparelho aguarda
validação. A abertura de reservas Nicolini depende dos dias/horários reais
e do aceite, sem tornar os provedores um gate artificial dessa jornada. Aceite: `NOT_RUN(Pedro)`.

**Histórico R1, anterior à R2 acima:** integração de `public/menu`
recuperada de `78c7b0b` sobre a publicação Rustichella `9a2fd92`. Novo código
`e1188ec`, deployment promovido `dpl_DmTbLPFKVoed3F9qgw4DsDdK3ZZJ`.
Playwright de produção 5 PASS, incluindo confirmação, agenda, remarcação e
cancelamento em restaurante fictício isolado/arquivado. Nicolini permanece com
reservas online fechadas até cadastrar mesas e horários reais. Textos/estética
publicados da Rustichella e links Bistrô → WhatsApp preservados; alterações locais
de paralaxe/CSS de outra frente intactas e fora desta publicação. O candidato
antigo `dpl_9eqLtHLc31fHTPpPt7rYr7B7rjC7` não foi promovido.
Evidências completas em `Capilano Engines/restaurantes/docs/STATUS.md`.

**Rotas públicas:** `/` é Empório; `/bistro` é a vitrine; `/menu/` reúne cardápio
e reservas. `/bistro/menu` abre `/menu/`; `/bistro/reservas` abre diretamente
`/menu/#/reserva`. Links existentes da vitrine continuam no WhatsApp. O domínio
provável `nicolinigastronomia.com` depende de confirmação do cliente: não foi
conectado nem alterado DNS. A mesma estrutura de caminhos funcionará nele;
ao conectar, liberar somente as origens definitivas no CORS do engine.

> Leia antes o [`README.md`](../../README.md) da raiz. Este arquivo é o contexto
> detalhado do app `apps/institucional`.

## O que é

Presença pública da **loja física** da Nicolini. É a experiência mais editorial e
cinematográfica da marca — a casa, os balcões, o repertório e a visita. Até
11/11/2026 era só isso, sem departamentos comerciais, busca, CEP, conta,
carrinho ou checkout; o plano do site acrescenta blog, eventos, produtos e
pedido sem pagamento (ver o estado no topo).

**Papel estratégico:** é o site que responde por "Nicolini" na internet. O
protótipo do e-commerce deixou de ser produto a construir: é a base do design
do site novo (SPEC D21).

**Versionamento/publicação (21/09/2026):** este app, incluindo o `/menu`
integrado em `public/menu`, possui seu próprio Git local e o repositório GitHub
`pinotnoirpeter1971/nicolini-institucional` (hoje **público**; ver o estado de 11/11 no topo). O alias publicado na Vercel
é a referência operacional até que uma mudança seja validada e promovida.
E-commerce e `apps/webapp-bistro` não entram no índice.

**Publicação Git comprovada (21/09/2026):** o commit inicial `0fe4bf3`
disparou a produção Vercel `dpl_FCVBqk44EsFURt9x9ThYSm8Jc2jG`; o alias
`https://nicolini-institucional.vercel.app` e as rotas `/menu/`,
`/menu/js/app.js` e o logo do menu responderam HTTP 200. A rota estática está
no ar, mas o DTO publicado do Engine, acessado via `/menu-engine`, recebe 302
para o Vercel SSO do Preview do Engine. Logo, a jornada real de cardápio segue
**BLOQUEADA por proteção externa**, sem retorno aos fixtures, até a validação
autenticada do Engine.

**Reteste browser autenticado (21/09/2026):** uma sessão Safari já autenticada
na Vercel abriu diretamente o Preview do Engine e recebeu o DTO publicado da
Nicolini. Porém, no alias público do institucional, `/menu/` exibiu o estado
honesto “Cardápio indisponível — Protected deployment”. A autenticação não é
repassada pelo rewrite interprojeto `/menu-engine`; portanto, login na Vercel
por si só não fecha o gate público. Não reduzir a Deployment Protection nem
introduzir segredo no cliente sem decisão explícita.

**Integração Production (21/09/2026):** o Engine foi promovido no alias
`https://capilano-restaurant-engines.vercel.app` após `/login` e o DTO público
da Nicolini responderem HTTP 200. O rewrite `/menu-engine` e a configuração de
preview deste app passaram a apontar para esse alias Production, substituindo
o candidato protegido por Vercel SSO.

## O que vive dentro deste app

Um único projeto (Next desde 11/11/2026; antes React/Vite) com quatro frentes:

| Rota | O que é |
|---|---|
| `/` | **Home institucional:** hero em vídeo, "A casa", galeria decorativa, tarja de origem, cinco balcões, Blog Nicolini, encerramento de visita. |
| `/a-loja` | Página utilitária: endereço, horários, contato, fotos, mapa. |
| `/bistro` | **Site do Bistrô** — a *vitrine*: apresentação, ambiente, galeria, contato. Não confundir com o **web app** de cardápio/reservas (`apps/webapp-bistro`), que é outra coisa. |
| `/rustichella` e `/bistro/rustichella` | **Landing do evento** jantar Bistrô Nicolini × Rustichella d'Abruzzo. Formato landing page. A URL curta `/rustichella` é de propósito: vai na bio do Instagram e no impresso. O evento tem data, preço e canal de reserva próprios. O evento passou, mas a landing **fica** no site (decisão de 11/11): vira um evento dentro de "Eventos". `/bistro/rustichella` redireciona para `/rustichella`. |

## Dados — cada fonte tem seu arquivo, de propósito

- `src/data/casa.js` — **fonte única** do Empório: endereço, telefone, CNPJ,
  razão social, horários. Dados de registros públicos (Receita/ReceitaWS),
  **confirmar antes de publicar**.
- `src/data/bistro.js` — fonte única do Bistrô. Endereço vem de `casa.js` (mesmo
  prédio, mezanino); telefone/WhatsApp e horários são provisórios.
- `src/data/rustichella.js` — fonte única da landing do evento. **Não** se mistura
  com `bistro.js`: o jantar é temporário.

## Componentes e páginas

- `app/` — as rotas do Next; cada `page.tsx` só aponta para a página em `src/paginas/` e declara os metadados.
- `src/paginas/` — `Home.jsx`, `Loja.jsx`, `Bistro.jsx`, `Rustichella.jsx` (a pasta saiu de `src/pages/` porque o Next trataria esse nome como roteador antigo).
- `src/components/` — `Layout.jsx`, `Balcoes.jsx`, `CasaFotos.jsx`,
  `GaleriaBistro.jsx`, `Reveal.jsx`, `Icons.jsx`.
- `src/styles/` — CSS por área, inclusive os temas `tema--bistro` e `tema--rustichella` (ordem no topo deste arquivo).
- `public/media/` — `bistro/`, `bistro/galeria/`, `blog/`, `loja/`, `rustichella/`.

## Conteúdo e fotografia

O site está no ar com estes textos e fotos. Endereço, CNPJ e razão social vêm
de registros públicos; horários, telefone e WhatsApp do Bistrô seguem
marcados como provisórios em `src/data/`. Pedro edita no ar, e a troca do
conteúdo fixo pela entrega da casa do Engine não é desta frente. Na landing
`/rustichella`, o que ainda é provisório está marcado `// MOCKUP` e `CONFIRMAR`
em `src/data/rustichella.js` (preço "R$ 000", nota de pagamento, modo de
serviço, horário de chegada). O item "Blog" do menu leva a uma seção da home;
ainda não existe como rota própria (o blog de verdade vem pelo plano do site).

**Atualização editorial (21/09/2026):** o primeiro parágrafo abaixo do título em
`/rustichella` e `/bistro/rustichella` foi atualizado para o texto aprovado pelo
cliente: “Um dos pastifícios mais renomados da Itália chegará a Caxias do Sul,
trazendo a proprietária Stefania juntamente de seu Chef estrelado Emmanuel di
Liddo, marcando três noites inesquecíveis com a mais alta gastronomia no Bistrô
Nicolini.”

**Ajuste visual (21/09/2026):** a caixa do primeiro parágrafo do hero de
`/rustichella` foi ampliada de `46ch` para `64ch`, mantendo a limitação natural
do container em telas estreitas. O hero também passou a usar a mesma paralaxe
contida do Bistrô, com movimento apenas na foto, `requestAnimationFrame` e
respeito a `prefers-reduced-motion`; texto, logos e links permanecem estáticos.

## Relação com os outros apps

- Mesma marca do e-commerce, **arquitetura diferente**. O institucional não
  precisa de estrutura de loja; o e-commerce não é molde dele.
- O e-commerce **poderá herdar** voz, blocos editoriais e fundamentos visuais
  daqui no futuro — sem obrigação de ficarem idênticos.
- Direção visual, diagnóstico e plano detalhados:
  [`docs/DIRECAO_E_PLANO_INSTITUCIONAL.md`](../../docs/DIRECAO_E_PLANO_INSTITUCIONAL.md).
  Itens só valem como aprovados se marcados como **direção aprovada** lá.

## Limites

- Catálogo e pedido sem pagamento estão autorizados pelo plano em
  `Capilano Suite/plans/nicolini-site/` (11/11/2026), com dados e regras no
  Engine. Pagamento, checkout e busca pública continuam fora.
- Não redesenhar o e-commerce a partir daqui.

## Rodar

Ver [`README.md`](README.md): `npm ci --workspaces=false`, `npm run dev`
(laboratório em 5183, aberto na rede), `npm run build`.
