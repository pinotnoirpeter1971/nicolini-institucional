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
