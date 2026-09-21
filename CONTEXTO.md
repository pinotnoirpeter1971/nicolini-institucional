# Contexto — Institucional Nicolini

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

**Atualização editorial (18/09/2026):** o resumo do hero de `/rustichella` é
“Um dos pastifícios mais renomados da alta gastronomia vem da Itália até Caxias
do Sul, com menu especial no Bistrô Nicolini.”

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
