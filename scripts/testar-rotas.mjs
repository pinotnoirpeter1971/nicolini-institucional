#!/usr/bin/env node
/*
 * Teste do contrato de endereços do site (tabela "Rotas e o que não pode
 * quebrar" do CONTEXTO.md). Sobe `next start` numa porta livre sobre o build
 * que já existe em .next/, confere cada endereço e encerra. Node puro.
 *
 *   npm run build && npm run test:rotas     (ou só `npm test`, que faz os dois)
 *
 * Não depende do Engine no ar: do /menu-engine/... confere só que a rota não
 * é um 404 do site.
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { request } from 'node:http';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
if (!existsSync(join(raiz, '.next', 'BUILD_ID'))) {
  console.error('Sem build em .next/. Rode `npm run build` antes (ou `npm test`).');
  process.exit(1);
}

const portaLivre = () =>
  new Promise((ok, falha) => {
    const s = createServer();
    s.once('error', falha);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });

const porta = await portaLivre();
const servidor = spawn(join(raiz, 'node_modules', '.bin', 'next'), ['start', '--hostname', '127.0.0.1', '--port', String(porta)], {
  cwd: raiz,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let saida = '';
servidor.stdout.on('data', (d) => (saida += d));
servidor.stderr.on('data', (d) => (saida += d));

/* GET cru, sem seguir redirect e sem normalizar o caminho (// e \ chegam como estão). */
function pedir(caminho) {
  return new Promise((ok, falha) => {
    const req = request({ host: '127.0.0.1', port: porta, path: caminho, method: 'GET', headers: { 'accept-encoding': 'identity' } }, (res) => {
      let corpo = '';
      res.setEncoding('utf8');
      res.on('data', (d) => (corpo += d));
      res.on('end', () => ok({ status: res.statusCode, headers: res.headers, corpo }));
    });
    req.on('error', falha);
    req.setTimeout(15000, () => req.destroy(new Error(`tempo esgotado em ${caminho}`)));
    req.end();
  });
}

async function esperarNoAr() {
  for (let i = 0; i < 100; i++) {
    try {
      await pedir('/robots.txt');
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error(`next start não respondeu na porta ${porta}:\n${saida}`);
}

let falhas = 0;
let total = 0;
function conferir(nome, condicao, detalhe = '') {
  total++;
  if (condicao) console.log(`  ok    ${nome}`);
  else {
    falhas++;
    console.log(`  FALHA ${nome}${detalhe ? `  (${detalhe})` : ''}`);
  }
}

async function pagina(caminho, testes = () => {}) {
  const r = await pedir(caminho);
  conferir(`${caminho} → 200`, r.status === 200, `veio ${r.status} ${r.headers.location ?? ''}`);
  testes(r);
  return r;
}

async function redirect(caminho, status, destino) {
  const r = await pedir(caminho);
  conferir(`${caminho} → ${status} ${destino}`, r.status === status && r.headers.location === destino, `veio ${r.status} ${r.headers.location ?? '(sem location)'}`);
}

/* Redirect que não pode sair do site: ou não redireciona, ou o destino é um caminho local. */
async function semRedirectAberto(caminho) {
  const r = await pedir(caminho);
  const loc = r.headers.location;
  const local = !loc || (/^\/(?![/\\])/.test(loc) && !/^\/\\/.test(loc));
  conferir(`${JSON.stringify(caminho)} não redireciona para fora`, local, `veio ${r.status} ${loc}`);
}

const meta = (html, re) => (html.match(re) || [])[1];

/* Endereço em outra caixa que abre a página por rewrite: 200, sem redirect, com o canônico em minúsculas. */
async function pagina_(caminho, canonicoEsperado) {
  const r = await pedir(caminho);
  const canonico = meta(r.corpo, /<link rel="canonical" href="([^"]+)"/) || '';
  conferir(
    `${caminho} → 200 com a página ${canonicoEsperado}`,
    r.status === 200 && !r.headers.location && new URL(canonico || 'http://x/').pathname === canonicoEsperado,
    `veio ${r.status} ${r.headers.location ?? ''} canônico ${canonico}`,
  );
}

/*
 * A Vercel casa as regras do routes-manifest SEM diferenciar maiúsculas, mas os
 * arquivos estáticos (as páginas prontas e public/) diferenciam. O next start
 * local não reproduz isso inteiro (no macOS o disco também não diferencia), então
 * o roteamento é simulado aqui sobre o manifesto, com e sem a flag `i`:
 * redirects (o primeiro que casa, seguido até o fim, acusando laço), depois os
 * rewrites beforeFiles, os arquivos (com diferença de caixa) e os afterFiles.
 */
function simularRoteamento() {
  const manifesto = JSON.parse(readFileSync(join(raiz, '.next', 'routes-manifest.json'), 'utf8'));
  const { redirects, rewrites } = manifesto;
  const antes = Array.isArray(rewrites) ? [] : rewrites.beforeFiles;
  const depois = Array.isArray(rewrites) ? rewrites : rewrites.afterFiles;
  const paginas = new Set(['/', '/a-loja', '/bistro', '/rustichella']);
  const publicos = new Set();
  const listar = (dir, prefixo) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const caminho = `${prefixo}/${item.name}`;
      if (item.isDirectory()) listar(join(dir, item.name), caminho);
      else publicos.add(caminho);
    }
  };
  listar(join(raiz, 'public'), '');
  const existe = (c) => paginas.has(c) || publicos.has(c);

  /* Troca :nome (e :nome+ / :nome*) do destino pelo grupo de mesmo número na fonte. */
  const destino = (regra, m) => {
    const nomes = [...regra.source.matchAll(/:([A-Za-z_]\w*)/g)].map((x) => x[1]);
    return regra.destination.replace(/:([A-Za-z_]\w*)[+*?]?/g, (_, nome) => m[nomes.indexOf(nome) + 1] ?? '');
  };
  const casar = (regras, caminho, flags) => {
    for (const regra of regras) {
      if (regra.internal) continue;
      const m = new RegExp(regra.regex, flags).exec(caminho);
      if (m) return { regra, para: destino(regra, m) };
    }
    return null;
  };

  function resolver(caminho, flags) {
    const vistos = [caminho];
    let atual = caminho;
    for (let i = 0; i < 8; i++) {
      const r = casar(redirects, atual, flags);
      if (!r) break;
      const proximo = r.para.split('#')[0];
      if (vistos.includes(proximo)) return { laco: [...vistos, proximo] };
      vistos.push(proximo);
      atual = proximo;
    }
    if (vistos.length > 4) return { laco: vistos };
    let alvo = atual;
    const a = casar(antes, alvo, flags);
    if (a) alvo = a.para;
    if (!existe(alvo)) {
      const d = casar(depois, alvo, flags);
      if (d) alvo = d.para;
    }
    return { redirects: vistos.slice(1), alvo, existe: existe(alvo) };
  }

  /* [endereço pedido, onde a barra de endereço termina, o que é servido] */
  const casos = [
    ['/', '/', '/'],
    ['/rustichella', '/rustichella', '/rustichella'],
    ['/Rustichella', '/Rustichella', '/rustichella'],
    ['/RUSTICHELLA', '/RUSTICHELLA', '/rustichella'],
    ['/RUSTICHELLA/', '/RUSTICHELLA', '/rustichella'],
    ['/rustichella/', '/rustichella', '/rustichella'],
    ['/bistro', '/bistro', '/bistro'],
    ['/Bistro', '/Bistro', '/bistro'],
    ['/BISTRO/', '/BISTRO', '/bistro'],
    ['/a-loja', '/a-loja', '/a-loja'],
    ['/A-Loja', '/A-Loja', '/a-loja'],
    ['/A-LOJA', '/A-LOJA', '/a-loja'],
    ['/menu', '/menu/', '/menu/index.html'],
    ['/Menu', '/menu/', '/menu/index.html'],
    ['/MENU', '/menu/', '/menu/index.html'],
    ['/menu/', '/menu/', '/menu/index.html'],
    ['/Menu/', '/Menu/', '/menu/index.html'],
    ['/MENU/', '/MENU/', '/menu/index.html'],
    ['/menu/css/app.css', '/menu/css/app.css', '/menu/css/app.css'],
    ['/MENU/css/app.css', '/MENU/css/app.css', '/menu/css/app.css'],
    ['/Menu/js/app.js', '/Menu/js/app.js', '/menu/js/app.js'],
    ['/bistro/rustichella', '/rustichella', '/rustichella'],
    ['/rustichella.html', '/rustichella', '/rustichella'],
    ['/index.html', '/', '/'],
  ];
  /* Só no casamento sem caixa (o da Vercel) estas também acertam. */
  const soSemCaixa = [
    ['/Bistro/Rustichella', '/rustichella', '/rustichella'],
    ['/Rustichella.html', '/rustichella', '/rustichella'],
    ['/BISTRO/MENU', '/menu/', '/menu/index.html'],
  ];
  for (const flags of ['', 'i']) {
    const nome = flags ? 'sem diferença de caixa' : 'com diferença de caixa';
    for (const [pedido, barra, servido] of flags ? [...casos, ...soSemCaixa] : casos) {
      const r = resolver(pedido, flags);
      if (r.laco) {
        conferir(`[${nome}] ${pedido} sem laço`, false, r.laco.join(' → '));
        continue;
      }
      const fim = r.redirects.at(-1) ?? pedido;
      conferir(
        `[${nome}] ${pedido} → ${barra === pedido ? '' : `${barra}, `}serve ${servido}`,
        fim === barra && r.alvo === servido && r.existe,
        `terminou em ${fim} servindo ${r.alvo}${r.existe ? '' : ' (não existe)'}`,
      );
    }
    /* Nenhum redirect volta a casar o próprio destino: destino fixo não redireciona de novo. */
    for (const regra of redirects.filter((x) => !x.internal && !x.destination.includes(':'))) {
      const alvo = regra.destination.split('#')[0];
      conferir(`[${nome}] destino ${alvo} de ${regra.source} não redireciona`, !casar(redirects, alvo, flags));
    }
  }
}

try {
  await esperarNoAr();
  console.log(`next start em 127.0.0.1:${porta}\n`);

  console.log('Páginas fixas');
  const home = await pagina('/', (r) => {
    conferir('/ og:image da casa', /og-nicolini\.jpg/.test(meta(r.corpo, /<meta property="og:image" content="([^"]+)"/) || ''));
    conferir('/ sem Google Fonts', !/fonts\.(googleapis|gstatic)\.com/.test(r.corpo));
  });
  await pagina('/a-loja');
  await pagina('/bistro');
  await pagina('/rustichella', (r) => {
    const titulo = meta(r.corpo, /<title>([^<]+)<\/title>/) || '';
    const ogImagem = meta(r.corpo, /<meta property="og:image" content="([^"]+)"/) || '';
    const canonico = meta(r.corpo, /<link rel="canonical" href="([^"]+)"/) || '';
    const tituloHome = meta(home.corpo, /<title>([^<]+)<\/title>/) || '';
    conferir('/rustichella <title> próprio', /Rustichella/.test(titulo) && titulo !== tituloHome, titulo);
    conferir('/rustichella og:image própria', /\/media\/rustichella\/og-rustichella\.jpg$/.test(ogImagem), ogImagem);
    conferir('/rustichella canônico próprio', /\/rustichella$/.test(canonico), canonico);
  });

  console.log('\n/menu/ (o endereço que circula)');
  const menu = await pagina('/menu/', (r) => {
    conferir('/menu/ sem redirect', !r.headers.location);
    conferir('/menu/ é o app (./css/app.css)', r.corpo.includes('href="./css/app.css"'));
  });
  const js = (menu.corpo.match(/src="\.\/(js\/[^"]+\.js)"/) || [])[1];
  conferir('/menu/ referencia um ./js/…', Boolean(js), 'nenhum ./js/ no HTML');
  const css = await pedir('/menu/css/app.css');
  conferir('/menu/css/app.css → 200 text/css', css.status === 200 && /text\/css/.test(css.headers['content-type'] || ''), `${css.status} ${css.headers['content-type']}`);
  if (js) {
    const r = await pedir(`/menu/${js}`);
    conferir(`/menu/${js} → 200 javascript`, r.status === 200 && /javascript/.test(r.headers['content-type'] || ''), `${r.status} ${r.headers['content-type']}`);
  }
  await redirect('/menu', 308, '/menu/');
  const engine = await pedir('/menu-engine/api/v1/public/restaurants/nicolini');
  conferir('/menu-engine/… é reescrito (não é 404 do site)', engine.status !== 404, `veio ${engine.status}`);

  console.log('\nRedirects');
  await redirect('/bistro/reservas', 307, '/menu/#/reserva');
  await redirect('/bistro/menu', 307, '/menu/');
  await redirect('/bistro/rustichella', 308, '/rustichella');
  await redirect('/rustichella.html', 308, '/rustichella');
  await redirect('/index.html', 308, '/');

  console.log('\nOutra caixa (o next start, como a Vercel, casa as regras sem diferenciar maiúsculas)');
  for (const [caminho, pagina] of [['/Rustichella', '/rustichella'], ['/RUSTICHELLA', '/rustichella'], ['/Bistro', '/bistro'], ['/A-Loja', '/a-loja']]) {
    await pagina_(caminho, pagina);
  }
  await redirect('/RUSTICHELLA/', 308, '/RUSTICHELLA');
  await redirect('/Menu', 308, '/menu/');
  await redirect('/MENU', 308, '/menu/');
  const menuCaixa = await pedir('/MENU/');
  conferir('/MENU/ → 200 com o app, sem redirect', menuCaixa.status === 200 && !menuCaixa.headers.location && menuCaixa.corpo.includes('href="./css/app.css"'), `veio ${menuCaixa.status} ${menuCaixa.headers.location ?? ''}`);
  const cssCaixa = await pedir('/MENU/css/app.css');
  conferir('/MENU/css/app.css → 200 text/css', cssCaixa.status === 200 && /text\/css/.test(cssCaixa.headers['content-type'] || ''), `${cssCaixa.status}`);

  console.log('\nRoteamento da Vercel simulado sobre o routes-manifest (com e sem diferença de caixa)');
  simularRoteamento();

  console.log('\nBarra final (nenhuma página com dois endereços)');
  await redirect('/a-loja/', 308, '/a-loja');
  await redirect('/bistro/', 308, '/bistro');
  await redirect('/rustichella/', 308, '/rustichella');
  await semRedirectAberto('//exemplo.com/');
  await semRedirectAberto('//exemplo.com/a/');
  await semRedirectAberto('/\\exemplo.com/');
  await semRedirectAberto('/%2Fexemplo.com/');
  /* O next start já junta barras repetidas antes das regras; a Vercel casa as
   * regras pelo routes-manifest. A defesa própria vale lá: a regra de barra
   * final não pode casar caminho que comece com // ou /\. */
  const manifesto = JSON.parse(readFileSync(join(raiz, '.next', 'routes-manifest.json'), 'utf8'));
  const barraFinal = manifesto.redirects.find((r) => r.destination === '/:caminho');
  const re = new RegExp(barraFinal.regex, manifesto.caseSensitive ? '' : 'i');
  for (const c of ['//exemplo.com/', '//exemplo.com/a/', '/\\exemplo.com/']) {
    conferir(`regra de barra final (manifesto) não casa ${JSON.stringify(c)}`, !re.test(c));
  }
  conferir('regra de barra final (manifesto) casa /a-loja/', re.test('/a-loja/'));
  conferir('regra de barra final (manifesto) não casa /menu/', !re.test('/menu/'));

  console.log('\n404');
  const nf = await pedir('/nao-existe');
  conferir('/nao-existe → 404', nf.status === 404, `veio ${nf.status}`);
  conferir('/nao-existe mostra a página do site', nf.corpo.includes('Página não encontrada'));

  console.log('\nCabeçalhos (build de produção)');
  for (const caminho of ['/', '/rustichella', '/menu/']) {
    const r = await pedir(caminho);
    conferir(`${caminho} X-Content-Type-Options: nosniff`, r.headers['x-content-type-options'] === 'nosniff');
    conferir(`${caminho} Referrer-Policy: strict-origin-when-cross-origin`, r.headers['referrer-policy'] === 'strict-origin-when-cross-origin');
    const csp = r.headers['content-security-policy'] || '';
    conferir(
      `${caminho} frame-ancestors (self, painel atual e futuro, laboratório do painel)`,
      ["'self'", 'https://capilano-restaurant-engines.vercel.app', 'https://gestao.capilanocreative.com', 'http://127.0.0.1:3200', 'http://localhost:3299'].every((o) =>
        csp.includes(o),
      ) && csp.startsWith('frame-ancestors'),
      csp,
    );
  }

  /*
   * Design de 12/11/2026: no build de produção, os módulos apagados em
   * src/menu-do-site.ts ficam fora do menu e do rodapé, sem bloco na home, e
   * nada do simulado entra no pacote. Blog, Eventos e Produtos respondem ou não
   * conforme o módulo no Engine (provado em testar-catalogo e testar-blog);
   * aqui, só os endereços do simulado, que nunca podem abrir, e as páginas que
   * o site trava sozinho (sacola, recibo e política).
   */
  console.log('\nMódulos apagados no build de produção (nada simulado vai a público)');
  for (const caminho of [
    '/produto/parmigiano-reggiano-24-meses',
    '/blog/jamon-de-bellota',
    '/eventos/nicolini-e-rustichella',
    '/sacola',
    '/pedido',
    '/politica-de-privacidade',
  ]) {
    const r = await pedir(caminho);
    conferir(`${caminho} → 404 com a página do site`, r.status === 404 && r.corpo.includes('Página não encontrada'), `veio ${r.status}`);
  }
  const pedido = await pedir('/pedido');
  conferir('/pedido Referrer-Policy: no-referrer', pedido.headers['referrer-policy'] === 'no-referrer', pedido.headers['referrer-policy']);

  /* Eventos está aceso no menu desde 12/11/2026; a página segue o Blog do Engine (sem Engine no teste: 404 acima). */
  const apagados = ['/produtos', '/blog', '/sacola', '/pedido', '/politica-de-privacidade'];
  for (const caminho of ['/', '/a-loja', '/bistro', '/rustichella', '/nao-existe']) {
    const r = await pedir(caminho);
    const links = [...r.corpo.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]);
    const proibidos = links.filter((l) => apagados.some((a) => l === a || l.startsWith(`${a}/`)) || l.startsWith('/produto/'));
    conferir(`${caminho} sem link para módulo apagado`, proibidos.length === 0, proibidos.join(' '));
    conferir(`${caminho} sem a sacola no header`, !r.corpo.includes('cabecalho__sacola'));
    /*
     * Decisão de Pedro (12/11/2026): as peças do header do e-commerce ficam à
     * vista, mas travadas. Todas desativadas, nenhuma leva a página que não
     * existe, nada de formulário; as de fora do header seguem apagadas.
     */
    const travadas = [...r.corpo.matchAll(/<button\b[^>]*class="(faixa-de-anuncio__cep|cabecalho__cep|cabecalho__icone|cabecalho__travado)"[^>]*>/g)];
    const soltas = travadas.filter((m) => !m[0].includes('aria-disabled="true"')).map((m) => m[1]);
    /* Busca e Departamentos destravados (12/11/2026; a busca é provisória): form GET para /produtos e botão que abre as categorias. */
    const busca = r.corpo.match(/<form\b[^>]*role="search"[^>]*>/g) ?? [];
    conferir(
      `${caminho} com faixa, CEP, conta e curtidos travados; busca (GET /produtos) e Departamentos ativos`,
      travadas.length === 6 && soltas.length === 0 && busca.length === 1 && busca[0].includes('action="/produtos"') && /<button\b[^>]*class="cabecalho__departamentos"[^>]*aria-expanded="false"/.test(r.corpo),
      `${travadas.length} botões, soltos: ${soltas.join(' ') || 'nenhum'}, busca: ${busca.join(' ')}`,
    );
    const semPagina = links.filter((l) => /^\/(busca|buscar|conta|minha-conta|curtidos|favoritos|departamentos|cep|checkout|entrar)(\/|$)/.test(l));
    conferir(`${caminho} sem link para página que não existe`, semPagina.length === 0 && !/<form\b(?![^>]*role="search")/.test(r.corpo), semPagina.join(' '));
    conferir(`${caminho} sem newsletter, selos de pagamento nem promessa de entrega`, !/newsletter|rodape__pagamentos|Entrega grátis/.test(r.corpo));
    conferir(`${caminho} sem o laboratório`, !/laboratorio|dados simulados/i.test(r.corpo));
    conferir(`${caminho} com o header novo (Eventos, Bistrô e Loja física)`, r.corpo.includes('class="cabecalho') && links.includes('/eventos') && links.includes('/bistro') && links.includes('/a-loja'));
  }
  const homeNova = await pedir('/');
  conferir('/ sem o destaque de produtos e sem o bloco do Blog', !/selecao-da-semana|id="blog"/.test(homeNova.corpo));
  /* O bloco da tábua de frios, o mesmo do e-commerce, confirmado por Pedro em 12/11/2026 (conteudoAConfirmar em src/menu-do-site.ts). */
  conferir('/ com o bloco da tábua de frios e o WhatsApp da casa', /id="tabua-de-frios"/.test(homeNova.corpo) && homeNova.corpo.includes('https://wa.me/5554999592314?text='));

  /* O simulado não pode estar no pacote: nem no JavaScript do navegador nem no do servidor. */
  const marcas = ['dados-simulados-do-laboratorio-nicolini', '5a1a0000-0000-4000-8000', 'Cinco Jotas', 'Caseificio Bertinelli', 'nicolini:laboratorio:'];
  const achados = [];
  const varrer = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const caminho = join(dir, item.name);
      if (item.isDirectory()) varrer(caminho);
      else if (/\.(js|html|json|rsc|body|txt|map)$/.test(item.name)) {
        const texto = readFileSync(caminho, 'utf8');
        for (const m of marcas) if (texto.includes(m)) achados.push(`${caminho.replace(raiz, '')} (${m})`);
      }
    }
  };
  varrer(join(raiz, '.next', 'static'));
  varrer(join(raiz, '.next', 'server'));
  conferir('build de produção sem dado simulado nem laboratório (.next/static e .next/server)', achados.length === 0, achados.slice(0, 5).join(', '));

  console.log('\nrobots.txt e sitemap.xml');
  const robots = await pedir('/robots.txt');
  conferir('robots.txt → 200', robots.status === 200);
  conferir('robots.txt nunca bloqueia a leitura', /Allow: \//.test(robots.corpo) && !/Disallow:\s*\/\s*$/m.test(robots.corpo), robots.corpo);
  conferir('robots.txt aponta o sitemap (indexável)', /Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/.test(robots.corpo));
  const sitemap = await pedir('/sitemap.xml');
  const locs = [...sitemap.corpo.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  conferir('sitemap.xml → 200 com as quatro páginas fixas', sitemap.status === 200 && ['/', '/a-loja', '/bistro', '/rustichella'].every((p) => locs.includes(p)), locs.join(' '));
  /* Blog, Eventos e Produtos entram conforme o Engine; as páginas que o site trava e o simulado, nunca. */
  const proibidasNoSitemap = locs.filter((p) => /^\/(sacola|pedido|politica-de-privacidade)(\/|$)|parmigiano-reggiano-24-meses|jamon-de-bellota/.test(p));
  conferir('sitemap.xml sem página travada nem simulada', proibidasNoSitemap.length === 0, locs.join(' '));
} catch (erro) {
  falhas++;
  console.error(erro);
} finally {
  servidor.kill('SIGTERM');
}

console.log(`\n${total - falhas}/${total} verificações passaram${falhas ? `, ${falhas} falharam` : ''}.`);
process.exit(falhas ? 1 : 0);
