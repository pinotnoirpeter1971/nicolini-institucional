// Config do menu de TESTE: mesma forma de public/menu/js/engine-config.js, mas apontando
// para o Engine de staging local. Nunca é publicado: só o staging/serve.mjs entrega este
// arquivo, no lugar do de produção. Em 127.0.0.1 o menu lê o restaurante fictício
// (Bistrô Teste); em localhost, a cópia da Nicolini (mesmos cardápios e campos `menus.*`).
window.CAPILANO_ENGINE = Object.freeze({
  sdkVersion: '0.2.0',
  apiBaseUrl: 'http://127.0.0.1:3200',
  publicApiBaseUrl: '/menu-engine',
  reservationApiBaseUrl: 'http://127.0.0.1:3200',
  restaurantKey: window.location.hostname === 'localhost' ? 'nicolini-copia' : 'bistro-teste'
});
