// Config do menu de TESTE: mesma forma de public/menu/js/engine-config.js, mas apontando
// para o Engine de staging local e para o restaurante fictício. Nunca é publicado:
// só o staging/serve.mjs entrega este arquivo, no lugar do de produção.
window.CAPILANO_ENGINE = Object.freeze({
  sdkVersion: '0.1.0',
  apiBaseUrl: 'http://127.0.0.1:3200',
  publicApiBaseUrl: '/menu-engine',
  reservationApiBaseUrl: 'http://127.0.0.1:3200',
  restaurantKey: 'bistro-teste'
});
