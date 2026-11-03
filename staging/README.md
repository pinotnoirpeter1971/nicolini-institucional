# Menu de teste (staging)

Serve o `/menu` do institucional lendo do **Engine de staging local** e do restaurante
fictício `bistro-teste`. Nada aqui entra no build nem no deploy: `staging/` fica fora de
`public/` e do `vite build`.

```bash
node staging/serve.mjs        # http://127.0.0.1:5199/menu/
```

Pré-requisito: Engine de staging no ar em `http://127.0.0.1:3200` (roteiro em
`Capilano Engines/restaurantes-v2/docs/operations/staging.md`; a partir de lá,
`pnpm staging:site` chama este servidor).

- `engine-config.js` substitui, só neste servidor, `public/menu/js/engine-config.js`.
  O adaptador (`engine-adapter.js`), o de reservas e o SDK não foram alterados: o
  endereço do Engine e a chave do restaurante vêm só desse arquivo.
- O rewrite `/menu-engine/api/v1/public/restaurants/<chave>` do `vercel.json` é imitado
  pelo servidor, apontando para o Engine de staging. O servidor recusa Engine fora de
  loopback.
- Variáveis: `PORT` (5199, a origem já autorizada no Engine) e `ENGINE_STAGING_URL`.

## SDK 0.2.0 e horário ao vivo (branch `claude/menu-v2`)

O adaptador lê `content.house` do Engine (SDK 0.2.0, `vendor/…-0.2.0.js`): horários por dia no
fuso da casa, dias fechados e a frase pública do dia fechado. Sem `house` na resposta (Engine
antigo), mantém os horários de `dados.js`. A frase de "hoje" da capa vem de `casa.textoDeHoje`
(definida pelo adaptador); sem ele, `app.js` usa a tabela estática como antes.

## Fatia B: chave estável do cardápio e `nicolini-site@2` (SDK 0.3.0)

- Cada cardápio chega com `key` (não muda ao renomear) e com os próprios textos (`shortName`,
  `schedule`, `note`, `observation`, `priceNote`, `hero`). O adaptador usa a regra: se o
  campo próprio existe no cardápio, vale ele (mesmo `null`); senão lê `menus.<chave>.*`
  (publicações antigas). Sem `key`, a chave sai do nome pelo `menuKey()` do SDK 0.3.0.
- `service.id` continua o slug do nome (endereços que já circulam); `service.chave` é a
  chave estável, e `#/cardapio/<chave>` abre o mesmo cardápio depois de renomear.
- `site.manifest.json` (raiz do app, fora de `public/`) é o manifesto `nicolini-site@2`:
  capa, endereço, cidade, telefone, WhatsApp, Instagram e fotos da casa. Sem valor publicado,
  o site fica com o que está em `dados.js`.
- `staging/engine-config.js` usa `nicolini-copia` quando aberto por `localhost:5199` e
  `bistro-teste` por `127.0.0.1:5199`.

