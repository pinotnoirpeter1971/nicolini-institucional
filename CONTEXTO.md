> **21/09/2026 — Reservas R2 retomadas, em validação local.** `public/menu` contém
> revisão de aprovação humana/300 pessoas, horários exatos e datas bloqueadas.
> Sem commit/deploy desta rodada. Preservar alterações concorrentes em src/ e
> publicar futuramente só o lote autorizado. Estado de retomada no STATUS do engine.

# Contexto — Institucional Nicolini

**Reservas publicadas e validadas em 21/09/2026:** integração de `public/menu`
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
cinematográfica da marca — a casa, os balcões, o repertório e a visita — sem
departamentos comerciais, busca, CEP, conta, carrinho ou checkout.

**Papel estratégico:** fica no ar **enquanto o e-commerce está em construção**.
É o site que responde por "Nicolini" na internet hoje.

**Versionamento/publicação (21/09/2026):** este app, incluindo o `/menu`
integrado em `public/menu`, possui seu próprio Git local e o repositório GitHub
privado `pinotnoirpeter1971/nicolini-institucional`. O alias publicado na Vercel
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

Um único projeto React/Vite com quatro frentes:

| Rota | O que é |
|---|---|
| `/` | **Home institucional:** hero em vídeo, "A casa", galeria decorativa, tarja de origem, cinco balcões, Blog Nicolini, encerramento de visita. |
| `/a-loja` | Página utilitária: endereço, horários, contato, fotos, mapa. |
| `/bistro` | **Site do Bistrô** — a *vitrine*: apresentação, ambiente, galeria, contato. Não confundir com o **web app** de cardápio/reservas (`apps/webapp-bistro`), que é outra coisa. |
| `/rustichella` e `/bistro/rustichella` | **Landing do evento** jantar Bistrô Nicolini × Rustichella d'Abruzzo. Formato landing page. A URL curta `/rustichella` é de propósito: vai na bio do Instagram e no impresso. O evento tem data, preço e canal de reserva próprios e **sai do site depois de outubro**. |

## Dados — cada fonte tem seu arquivo, de propósito

- `src/data/casa.js` — **fonte única** do Empório: endereço, telefone, CNPJ,
  razão social, horários. Dados de registros públicos (Receita/ReceitaWS),
  **confirmar antes de publicar**.
- `src/data/bistro.js` — fonte única do Bistrô. Endereço vem de `casa.js` (mesmo
  prédio, mezanino); telefone/WhatsApp e horários são provisórios.
- `src/data/rustichella.js` — fonte única da landing do evento. **Não** se mistura
  com `bistro.js`: o jantar é temporário.

## Componentes e páginas

- `src/pages/` — `Home.jsx`, `Loja.jsx`, `Bistro.jsx`, `Rustichella.jsx`.
- `src/components/` — `Layout.jsx`, `Balcoes.jsx`, `CasaFotos.jsx`,
  `GaleriaBistro.jsx`, `Reveal.jsx`, `Icons.jsx`.
- `src/styles.css` — inclui o tema `tema--bistro` (marrons quentes + creme).
- `public/media/` — `bistro/`, `bistro/galeria/`, `blog/`, `loja/`, `rustichella/`.

## Conteúdo e fotografia

Textos, endereço, horários, telefone e CNPJ são **mockup**. Muitas fotos vieram do
acervo do e-commerce e servem como referência de enquadramento, não como arte
final. Substituir tudo antes de publicar. O item "Blog" do menu leva a uma seção
da home; ainda não existe como rota própria.

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

- Não introduzir venda, catálogo, busca ou checkout sem autorização explícita.
- Não redesenhar o e-commerce a partir daqui.

## Rodar

```bash
npm run dev:institucional   # http://localhost:5183
npm run build:institucional
```
