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
import { existsSync, readFileSync } from 'node:fs';
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
  await redirect('/Rustichella', 308, '/rustichella');
  await redirect('/RUSTICHELLA/', 308, '/rustichella');
  await redirect('/Bistro', 308, '/bistro');
  await redirect('/A-Loja', 308, '/a-loja');
  await redirect('/Menu', 308, '/menu/');

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

  console.log('\nrobots.txt e sitemap.xml');
  const robots = await pedir('/robots.txt');
  conferir('robots.txt → 200', robots.status === 200);
  conferir('robots.txt nunca bloqueia a leitura', /Allow: \//.test(robots.corpo) && !/Disallow:\s*\/\s*$/m.test(robots.corpo), robots.corpo);
  conferir('robots.txt aponta o sitemap (indexável)', /Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/.test(robots.corpo));
  const sitemap = await pedir('/sitemap.xml');
  const locs = [...sitemap.corpo.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  conferir('sitemap.xml → 200 com as quatro páginas fixas', sitemap.status === 200 && ['/', '/a-loja', '/bistro', '/rustichella'].every((p) => locs.includes(p)), locs.join(' '));
} catch (erro) {
  falhas++;
  console.error(erro);
} finally {
  servidor.kill('SIGTERM');
}

console.log(`\n${total - falhas}/${total} verificações passaram${falhas ? `, ${falhas} falharam` : ''}.`);
process.exit(falhas ? 1 : 0);
