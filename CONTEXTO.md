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
- **Design do site (Etapa 2, 12/11/2026): entregue no laboratório, aguardando
  o aceite de Pedro.** Moldura nova (header do e-commerce, rodapé de cinco
  colunas) em todas as páginas, e as telas novas (Produtos, Blog, Eventos,
  sacola, recibo, privacidade) com dados simulados, **só no `next dev`**. No
  build de produção os módulos estão apagados: o site no ar continua com as
  quatro páginas. Detalhes, escolhas e aceite na seção
  [Design do site](#design-do-site-etapa-2-12112026).
- **Catálogo ligado ao Engine (Etapa 3, trilha `nicolini/site-catalogo`):**
  Produtos, categoria e produto leem do Engine pelo SDK (`src/engine/fonte.ts`),
  guardados por 60 s (ISR), com índice e categorias em cache compartilhado (404
  barato). Módulo desligado no Engine: as páginas dão 404 e o sitemap não traz
  produtos, sem deploy. O item no menu continua configuração (`modulos.produtos`
  em `src/menu-do-site.ts`) e acende na ativação. `NEXT_PUBLIC_SITE_DADOS=engine`
  faz o `next dev` ler o Engine em vez do simulado. Teste: `npm run test:catalogo`
  (precisa do staging em `ENGINE_STAGING`, padrão `http://127.0.0.1:3280`).
- **Sacola e pedido ligados ao Engine (Etapa 3):** a sacola, o envio e o recibo
  falam direto com o Engine pelo SDK (`src/engine/navegador.ts`), no navegador:
  nada roda no servidor do site, e o token do recibo vai no `#` e no corpo do
  `POST`. No build de produção continuam apagados (`modulos.pedidos`). Para o
  `next dev` ler o staging: `NEXT_PUBLIC_SITE_DADOS=engine`,
  `NEXT_PUBLIC_ENGINE_URL=http://127.0.0.1:3280` e
  `NEXT_PUBLIC_ENGINE_CASA=bistro-teste` (por exemplo num
  `.env.development.local`, que não se versiona), aberto em
  `http://127.0.0.1:5183` (a origem autorizada); com isso o painel do
  laboratório some. Teste: `npm run test:pedidos` (casa recebendo: ponta a
  ponta, clique duplo e reenvio, preço alterado, recibo; casa pausada: recusa).
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
| `/Rustichella`, `/RUSTICHELLA`, `/Bistro`, `/A-Loja` (qualquer outra caixa) | 200 com a própria página (rewrite para o endereço em minúsculas; o canônico é o em minúsculas). Com barra final, primeiro 308 → sem a barra |
| `/Menu`, `/MENU` (sem barra, qualquer caixa) | 308 → `/menu/` |
| `/Menu/`, `/MENU/` (com barra, outra caixa) | 200 com o app de `public/menu` e os arquivos dele (`/MENU/css/…` por rewrite), sem redirect: um redirect para `/menu/` daria laço na Vercel |
| qualquer página com barra final (exceto `/menu/`) | 308 → sem a barra (nenhuma página com dois endereços). Caminho que começa com `//` ou `/\` não casa: seria redirect para fora do site |
| endereço inexistente | 404 de verdade (`app/not-found.tsx`); antes caía na home |

O redirect automático de barra do Next está desligado
(`skipTrailingSlashRedirect`) e o site faz os seus em `redirects()`, que na
Vercel viram regra de roteamento, não função. `public/menu` não se edita para
"consertar" barra.

**Caixa (12/11/2026).** Na Vercel as regras do `next.config.ts` casam **sem
diferenciar maiúsculas** (o `experimental.caseSensitiveRoutes` não chega ao
roteamento de lá; por isso saiu), mas os arquivos estáticos diferenciam. Um
redirect `/Rustichella → /rustichella` casaria também `/rustichella` e daria
laço. Por isso as páginas fixas em outra caixa abrem por rewrite (`afterFiles`,
só quando o endereço exato não existe) e cada regra é escrita com classes
(`[Rr][Uu]…`) para casar igual com e sem diferença de caixa. O `next start`
local também casa sem diferenciar, como a Vercel; o teste ainda simula os dois
casamentos sobre o `routes-manifest.json`.

**Teste do contrato:** `npm test --workspaces=false` (build + teste) ou, com
build pronto, `npm run test:rotas --workspaces=false`
(`scripts/testar-rotas.mjs`, Node puro). Sobe `next start` numa porta livre,
confere esta tabela, os cabeçalhos, o `robots.txt` e o `sitemap.xml`, simula o
roteamento da Vercel sobre o `routes-manifest.json` (com e sem diferença de
caixa, acusando laço) e
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
- O layout raiz **não chama o Engine** (SPEC-SITE §1.6): o menu vem de
  `src/menu-do-site.ts`. A moldura (header, rodapé, WhatsApp, painel da
  sacola) mora nos layouts de rota (`app/(casa)/layout.tsx`,
  `app/bistro/layout.tsx`, `app/rustichella/layout.tsx`).
- Os módulos apagados não entram no sitemap (continua com as quatro páginas
  fixas). `/pedido` responde com `Referrer-Policy: no-referrer` (o token do
  recibo vai no `#`, que não sai do navegador, mas o cabeçalho fecha a porta).

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

Áreas novas entram **no fim**, cada uma com arquivo próprio:

11. `componentes.css` — peças comuns das telas novas (botões, migalhas, foto, preço, quantidade, cartões, vazio, painel)
12. `produtos.css` — `/produtos`, categoria, produto, destaque e bloco vermelho da home
13. `blog.css` — `/blog`, categoria, matéria, `/eventos` e evento
14. `pedido.css` — sacola (painel e página), recibo e privacidade

Na trilha de design (12/11/2026) `moldura-cabecalho.css` e
`moldura-rodape.css` foram reescritos (header e rodapé do e-commerce), e
`responsivo.css` perdeu as regras do header e do rodapé antigos; os outros
arquivos de 1 a 10 seguem como vieram do `styles.css`, com ajustes pequenos.

### Fontes

Instrument Sans (normal 400–700, itálico 400–600) e Playfair Display (normal e
itálico 500–600), as mesmas famílias e faixas do antigo pedido ao Google, agora
em `src/fonts/` (woff2 variáveis de `@fontsource-variable` 5.3.0, latin e
latin-ext, licença OFL ao lado). Nenhuma das quatro páginas pede nada a
`fonts.googleapis.com`/`fonts.gstatic.com`; quem ainda pede é o iframe do mapa
do Google e o app `/menu/` (fora desta troca).

### Design do site (Etapa 2, 12/11/2026)

Trilha de design do plano (`Capilano Suite/plans/nicolini-site/DESIGN-BRIEF.md`),
na branch `nicolini/site-novo`, sobre `1cefd8c`. Base visual: o protótipo do
e-commerce (`~/Documents/nicolini-website`, referência, não fonte de CSS);
redação, abertura da home e acabamento do site no ar.

**Aceite de Pedro: pendente** (`NOT_RUN(Pedro)`). Registre aqui, nesta linha,
a data e o que foi aprovado ou pedido de volta. Capturas de cada tela e estado
(desktop 1440 e celular 390), com índice, entregues ao coordenador junto do
relatório da trilha.

**Módulos e chaves (`src/menu-do-site.ts`).** `modulos` diz o que está aceso:
Produtos, Blog, Eventos, Pedidos (sacola e recibo) e Privacidade valem
`laboratorio` (acesos no `next dev`, apagados no build de produção). Apagado:
página 404 estática, item fora do header e do rodapé, nenhum bloco na home,
nada no sitemap. Ligar um módulo na ativação (Etapa 3) é trocar o valor para
`true` e ligar a fonte em `src/engine/fonte.ts` e `src/engine/navegador.ts`,
que hoje lançam erro fora do laboratório. `pecasDeLoja` diz o que fazer com as
peças de loja completa (abaixo). `npm test` confere no build de produção que
nada disso vaza (404, links, peças travadas, marcas do simulado em
`.next/static` e `.next/server`, sitemap).

**Dados (`src/engine/`).** `sdk-0.7.0/` é cópia compilada do SDK público do
Engine (não editar; trocar pela versão nova quando o Engine mudar o contrato).
`simulado/` tem os dados de exemplo **no formato exato do SDK** e só existe no
laboratório (o `import` fica atrás de `process.env.NODE_ENV === 'development'`
escrito no próprio arquivo, para o build de produção cortar o código).
`fonte.ts` (servidor) e `navegador.ts` (sacola, envio, recibo) são o único
ponto que a Etapa 3 troca. `formato.ts` formata dinheiro, peso e datas.

**Laboratório (só `next dev`, `localhost:5183`).** Um botão
"Laboratório · dados simulados" no canto leva a todas as telas e estados e
escolhe o resultado do próximo envio da sacola. O endereço também serve:
`?sacola=cheia|com-avisos|vazia`, `?simular=normal|preco-mudou|item-saiu|pausada|limite|falha|nao-recebe`
na sacola, `?simular=vazio` nas listas, `?painel=sacola`. Recibos de exemplo:
`/pedido#rec1b0n0v0000001` (não enviado), `/pedido#rec1b0emandament` (em
atendimento), `/pedido#rec1b0zzzzzzzzzz` (não encontrado).

**Escolhas da trilha (para o aceite):**

1. **Header — decisão de Pedro (12/11/2026), acima do DESIGN-BRIEF §8:** o do
   protótipo do e-commerce, como ele é. Busca, "Receba em"/CEP, conta,
   curtidos, Departamentos e a faixa de anúncio ficam **à vista e travados**:
   desativados (`aria-disabled`/`disabled`, título "Em breve"), sem link, sem
   rede, sem guardar nada. No celular: menu, logo e sacola, a busca embaixo e
   o menu escuro do e-commerce, com "Curtidos" e "Minha conta" travados.
   Newsletter e selos de pagamento, fora do header, seguem apagados. Pedro
   decide depois o que cada peça faz (cada uma pede spec).
2. Texto da faixa: "Empório e Bistrô em Caxias do Sul", no lugar do
   "Entrega grátis em Caxias do Sul" do protótipo (promessa que a casa não
   fez). Pedro escolhe a mensagem.
3. As categorias da linha de baixo do header (Queijos, Charcutaria,
   Conservas, Massas, Vinhos) são configuração do site, não do Engine; na
   ativação precisam bater com os slugs reais. Com os módulos apagados, a
   linha mostra Departamentos (travado), Bistrô e Loja física.
4. Header preso ao rolar no desktop, com sombra; no celular rola com a página,
   como no e-commerce.
5. Home: a abertura do site no ar (vídeo e textos, sem botão, como hoje),
   ocupando o resto da primeira tela abaixo do header. O bloco vermelho da
   tábua de frios (brief §7) usa o texto do protótipo e "Fale com a casa" no
   WhatsApp. Pedro o confirmou em 12/11/2026 e ele está no ar
   (`conteudoAConfirmar.tabuaDeFrios` em `src/menu-do-site.ts`). O item
   "Eventos" do menu, ao lado do Bistrô, também acendeu nesse dia
   (`modulos.eventos`). As duas matérias de exemplo do
   Blog da home saíram (não tinham página); o Blog volta com o módulo, com
   matérias reais. Contato e horários foram para o rodapé; o mapa fica em
   `/a-loja`.
6. Rodapé de cinco colunas do e-commerce, com os dados reais de `casa.js`.
7. Rustichella e Bistrô recebem só a moldura, na cor de cada tema. A
   Rustichella perdeu a navegação por âncoras que tinha no header antigo e
   guarda a largura de antes; o resto não mudou.
8. `/eventos/<slug>` de evento com página própria leva a ela (a Rustichella);
   matéria pedida por `/eventos/` vai para `/blog/`.
9. Produto por peso: o cartão diz "Vendido por peso", o preço é "o quilo" com
   "A partir de N g", a quantidade anda em gramas e o total sai com "≈".
10. Sacola: painel lateral (pelo ícone) e página `/sacola` com resumo e envio;
    no celular, uma barra presa embaixo com o total e "Enviar pedido". No
    navegador ficam só ids e quantidades.
11. Vídeo do YouTube: miniatura com botão; o player (youtube-nocookie) só
    entra no clique.
12. Vazios com o "N" da marca e um caminho de volta.
13. Fontes do site (Instrument Sans e Playfair); as do protótipo ficaram fora.

**Fica para depois:** ligar ao Engine, `revalidate`, sitemap a partir dos
índices e JSON-LD (Etapa 3); a função de cada peça travada; fotos de produto
em fundo neutro (os simulados usam fotos da casa).

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
| `/produtos`, `/produtos/<categoria>`, `/produto/<slug>`, `/blog`, `/blog/categoria/<slug>`, `/blog/<slug>`, `/eventos`, `/eventos/<slug>`, `/sacola`, `/pedido`, `/politica-de-privacidade` | Telas do plano do site (12/11/2026). **Só no laboratório** até a ativação; no build de produção, 404. Ver Design do site no topo. |
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

- `app/` — as rotas do Next; cada `page.tsx` só aponta para a página em `src/paginas/` e declara os metadados. As páginas da casa ficam no grupo `app/(casa)/` (mesma moldura); `bistro/` e `rustichella/` têm layout próprio, com o tema.
- `src/paginas/` — `Home.jsx`, `Loja.jsx`, `Bistro.jsx`, `Rustichella.jsx`, `Produtos.tsx`, `Blog.tsx` (a pasta saiu de `src/pages/` porque o Next trataria esse nome como roteador antigo).
- `src/moldura/` — header, rodapé, peças travadas (`Guardadas.tsx`) e o que a moldura hospeda (painel da sacola, laboratório).
- `src/ui/` — peças das telas novas (foto, preço, quantidade, cartões, vídeo, blocos da matéria, "ver mais").
- `src/sacola/` — a sacola (armazém no navegador, painel, página) e o recibo.
- `src/engine/` — o SDK copiado, o simulado e a fonte (ver Design do site).
- `src/laboratorio/` — o painel do laboratório (só `next dev`).
- `src/menu-do-site.ts` — módulos, peças de loja e itens do menu.
- `src/components/` — `Balcoes.jsx`, `CasaFotos.jsx`,
  `GaleriaBistro.jsx`, `Reveal.jsx`, `Icons.jsx` (o `Layout.jsx` saiu: a
  moldura foi para `src/moldura/`).
- `src/styles/` — CSS por área, inclusive os temas `tema--bistro` e `tema--rustichella` (ordem no topo deste arquivo).
- `public/media/` — `bistro/`, `bistro/galeria/`, `blog/`, `loja/`, `rustichella/`.

## Conteúdo e fotografia

O site está no ar com estes textos e fotos. Endereço, CNPJ e razão social vêm
de registros públicos; horários, telefone e WhatsApp do Bistrô seguem
marcados como provisórios em `src/data/`. Pedro edita no ar, e a troca do
conteúdo fixo pela entrega da casa do Engine não é desta frente. Na landing
`/rustichella`, o que ainda é provisório está marcado `// MOCKUP` e `CONFIRMAR`
em `src/data/rustichella.js` (preço "R$ 000", nota de pagamento, modo de
serviço, horário de chegada). O Blog agora é rota própria (`/blog`), acesa
só no laboratório até a ativação; a seção de Blog da home aparece com ele.

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
