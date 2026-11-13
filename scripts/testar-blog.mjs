#!/usr/bin/env node
/*
 * Teste do Blog e dos Eventos contra o Engine (SPEC-SITE §11, "Páginas ligadas
 * ao Engine"). Node puro; usa um Engine de mentira (scripts/engine-de-mentira.mjs)
 * e dois builds de produção numa pasta própria (.next-teste-blog):
 *
 *   1. Build SEM Engine no ar (o build não depende dele), servido com o Blog
 *      DESLIGADO (404 do Engine, como a casa `nicolini` hoje): tudo escondido.
 *      Depois o Blog é ligado no Engine, sem novo build, e as páginas nascem
 *      sozinhas na revalidação.
 *   2. Build COM o Blog ligado: o dado do Engine na página, nos metadados e no
 *      sitemap; o custo (rotas guardadas, 404 barato, uma chamada por minuto).
 *
 * Opcional: com o staging local no ar (STAGING_ENGINE, padrão
 * http://127.0.0.1:3280, casa bistro-teste) confere também contra ele.
 *
 *   npm run test:blog       (leva ~3 min: espera a revalidação de 60 s)
 */
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { criarEngineDeMentira } from './engine-de-mentira.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
/* O Next acrescenta a pasta do build ao tsconfig.json; o teste devolve o arquivo como estava. */
const tsconfig = readFileSync(join(raiz, 'tsconfig.json'), 'utf8');
const DIST = '.next-teste-blog';
const nextBin = join(raiz, 'node_modules', '.bin', 'next');

const portaLivre = () =>
  new Promise((ok, falha) => {
    const s = createServer();
    s.once('error', falha);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

let falhas = 0;
function conferir(nome, condicao, detalhe = '') {
  if (condicao) console.log(`  ok    ${nome}`);
  else {
    falhas++;
    console.log(`  FALHA ${nome}${detalhe ? `  (${String(detalhe).slice(0, 300)})` : ''}`);
  }
}

function pedirEm(porta, caminho) {
  return new Promise((ok, falha) => {
    const req = request({ host: '127.0.0.1', port: porta, path: caminho, method: 'GET', headers: { 'accept-encoding': 'identity' } }, (res) => {
      let corpo = '';
      res.setEncoding('utf8');
      res.on('data', (d) => (corpo += d));
      res.on('end', () => ok({ status: res.statusCode, headers: res.headers, corpo }));
    });
    req.on('error', falha);
    req.setTimeout(30000, () => req.destroy(new Error(`tempo esgotado em ${caminho}`)));
    req.end();
  });
}

function executar(args, env) {
  return new Promise((ok) => {
    const p = spawn(nextBin, args, { cwd: raiz, env: { ...process.env, NEXT_DIST_DIR: DIST, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let saida = '';
    p.stdout.on('data', (d) => (saida += d));
    p.stderr.on('data', (d) => (saida += d));
    p.on('close', (codigo) => ok({ codigo, saida }));
  });
}

async function subir(env) {
  const porta = await portaLivre();
  const p = spawn(nextBin, ['start', '--hostname', '127.0.0.1', '--port', String(porta)], {
    cwd: raiz,
    env: { ...process.env, NEXT_DIST_DIR: DIST, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let saida = '';
  p.stdout.on('data', (d) => (saida += d));
  p.stderr.on('data', (d) => (saida += d));
  for (let i = 0; i < 100; i++) {
    try {
      await pedirEm(porta, '/robots.txt');
      return { porta, parar: () => p.kill('SIGTERM'), pedir: (c) => pedirEm(porta, c) };
    } catch {
      await dormir(200);
    }
  }
  p.kill('SIGTERM');
  throw new Error(`next start não respondeu:\n${saida}`);
}

async function subirEngine(porta, modo) {
  const e = criarEngineDeMentira({ modo });
  await new Promise((ok) => e.servidor.listen(porta, '127.0.0.1', ok));
  return e;
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const meta = (html, re) => (html.match(re) || [])[1];
const links = (html) => [...html.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]);
const titulos = (html) => [...html.matchAll(/<h3[^>]*>(?:<a [^>]*>)?([^<]+)/g)].map((m) => m[1]);

const ROTAS_DO_BLOG = ['/blog', '/blog/categoria/receita-do-mes', '/blog/massa-fresca-na-manteiga-e-sage', '/eventos', '/eventos/jantar-nicolini-e-rustichella'];

/* ── 1. Build sem Engine, Blog desligado e depois ligado ────────────────── */
async function fase1() {
  console.log('\n1. Build sem o Engine no ar; Blog desligado; depois ligado, sem novo build');
  const porta = await portaLivre();
  const env = { NEXT_PUBLIC_ENGINE_URL: `http://127.0.0.1:${porta}` };
  const build = await executar(['build'], env);
  conferir('o build passa com o Engine fora do ar', build.codigo === 0, build.saida.split('\n').slice(-15).join('\n'));
  if (build.codigo !== 0) return;
  for (const [rota, simbolo] of [['/blog/[slug]', /[○●]/], ['/eventos/[slug]', /[○●]/], ['/blog/categoria/[slug]', /[○●]/], ['/blog', /[○●]/], ['/eventos', /[○●]/], ['/', /[○●]/]]) {
    const linha = build.saida.split('\n').find((l) => l.includes(` ${rota} `) || l.trimEnd().endsWith(` ${rota}`));
    conferir(`saída do build: ${rota} é guardada (não dinâmica)`, Boolean(linha) && simbolo.test(linha), linha ?? 'rota ausente');
  }

  const engine = await subirEngine(porta, 'off');
  const site = await subir(env);
  try {
    for (const rota of ROTAS_DO_BLOG) {
      const r = await site.pedir(rota);
      conferir(`Blog desligado: ${rota} → 404 com a página do site`, r.status === 404 && r.corpo.includes('Página não encontrada'), r.status);
    }
    const home = await site.pedir('/');
    conferir('Blog desligado: home sem o bloco do Blog', home.status === 200 && !/id="blog"/.test(home.corpo));
    /* "Eventos" no menu é configuração do site (modulos.eventos, aceso em 12/11/2026), não do Engine. */
    conferir('Blog desligado: nenhuma página aponta para /blog', !links(home.corpo).some((l) => /^\/blog(\/|$)/.test(l)));
    const mapa = await site.pedir('/sitemap.xml');
    conferir('Blog desligado: sitemap só com as quatro páginas fixas', locs(mapa.corpo).length === 4, locs(mapa.corpo).join(' '));

    const antes = engine.chamadas.length;
    for (let i = 0; i < 6; i++) {
      const r = await site.pedir(`/blog/nao-existe-${i}`);
      if (r.status !== 404) conferir(`/blog/nao-existe-${i} → 404`, false, r.status);
    }
    await site.pedir('/eventos/nao-existe');
    conferir('Blog desligado: endereço inventado não gera chamada nova ao Engine', engine.chamadas.length === antes, `${engine.chamadas.length - antes} chamadas`);

    /* Liga o Blog no Engine. Nenhum build novo: as páginas guardadas se regeneram sozinhas (60 s + 60 s do índice). */
    engine.estado.modo = 'on';
    const inicio = Date.now();
    let blog = { status: 0 };
    while (Date.now() - inicio < 170000) {
      blog = await site.pedir('/blog');
      if (blog.status === 200) break;
      await dormir(5000);
    }
    conferir(`Blog ligado no Engine: /blog aparece sozinho na revalidação (${Math.round((Date.now() - inicio) / 1000)} s, sem novo build)`, blog.status === 200, blog.status);
    for (const rota of ['/eventos', '/blog/massa-fresca-na-manteiga-e-sage']) {
      let r = await site.pedir(rota);
      for (let i = 0; i < 30 && r.status !== 200; i++) {
        await dormir(5000);
        r = await site.pedir(rota);
      }
      conferir(`Blog ligado: ${rota} → 200`, r.status === 200, r.status);
    }
    let mapa2 = await site.pedir('/sitemap.xml');
    for (let i = 0; i < 30 && !locs(mapa2.corpo).includes('/blog'); i++) {
      await dormir(5000);
      mapa2 = await site.pedir('/sitemap.xml');
    }
    conferir('Blog ligado: o sitemap ganha as páginas do índice', locs(mapa2.corpo).includes('/blog') && locs(mapa2.corpo).includes('/blog/massa-fresca-na-manteiga-e-sage'), locs(mapa2.corpo).length);
  } finally {
    site.parar();
    engine.servidor.close();
  }
}

/* ── 2. Build com o Blog ligado ─────────────────────────────────────────── */
async function fase2(env, rotulo, esperado) {
  console.log(`\n2. Build com o Blog ligado (${rotulo})`);
  const build = await executar(['build'], env);
  conferir('o build passa', build.codigo === 0, build.saida.split('\n').slice(-15).join('\n'));
  if (build.codigo !== 0) return;
  conferir('páginas de matéria prontas já no build (generateStaticParams)', existsSync(join(raiz, DIST, 'server', 'app', 'blog', `${esperado.materia}.html`)));
  const site = await subir(env);
  try {
    const lista = await site.pedir('/blog');
    conferir('/blog → 200 com as matérias do Engine', lista.status === 200 && esperado.titulos.every((t) => lista.corpo.includes(t)), lista.status);
    conferir('/blog tem as categorias do Engine', esperado.categoria.test(lista.corpo));
    conferir('/blog guardada (cache-control com s-maxage)', /s-maxage=/.test(lista.headers['cache-control'] || ''), lista.headers['cache-control']);

    const m = await site.pedir(`/blog/${esperado.materia}`);
    const titulo = meta(m.corpo, /<title>([^<]+)<\/title>/) || '';
    conferir('matéria: <title>, descrição e canônico próprios', titulo.includes(esperado.tituloDaMateria) && /<meta name="description" content="[^"]+/.test(m.corpo) && new RegExp(`rel="canonical" href="[^"]*/blog/${esperado.materia}"`).test(m.corpo), titulo);
    conferir('matéria: og:image é a capa', esperado.imagem.test(meta(m.corpo, /<meta property="og:image" content="([^"]+)"/) || ''), meta(m.corpo, /<meta property="og:image" content="([^"]+)"/));
    const ld = meta(m.corpo, /<script type="application\/ld\+json">(.*?)<\/script>/s) || '';
    conferir('matéria: dados estruturados BlogPosting', ld.includes('"@type":"BlogPosting"'), ld.slice(0, 100));
    conferir('matéria sem JavaScript de terceiros nem iframe antes do clique', !/<iframe|youtube-nocookie|youtube\.com\/embed/.test(m.corpo));

    const categoria = await site.pedir(`/blog/categoria/${esperado.categoriaSlug}`);
    conferir(`/blog/categoria/${esperado.categoriaSlug} → 200 só com a categoria`, categoria.status === 200 && categoria.corpo.includes(esperado.tituloNaCategoria), categoria.status);

    const inexistente = await site.pedir('/blog/categoria/nao-existe');
    conferir('categoria inexistente → 404', inexistente.status === 404);

    const eventos = await site.pedir('/eventos');
    conferir('/eventos → 200', eventos.status === 200);
    if (esperado.proximosEmOrdem) {
      const ordem = titulos(eventos.corpo);
      const ix = esperado.proximosEmOrdem.map((t) => ordem.indexOf(t));
      conferir('/eventos: próximos do mais perto ao mais longe, depois os realizados', ix.every((i, n) => i >= 0 && (n === 0 || i > ix[n - 1])), `${ordem.join(' | ')}`);
    }
    if (esperado.eventoComPagina) {
      conferir(`/eventos: o cartão da ${esperado.eventoComPagina.titulo} leva direto à página própria`, links(eventos.corpo).includes(esperado.eventoComPagina.caminho), links(eventos.corpo).join(' '));
      const e = await site.pedir(`/eventos/${esperado.eventoComPagina.slug}`);
      conferir(`/eventos/${esperado.eventoComPagina.slug} redireciona para ${esperado.eventoComPagina.caminho}`, [307, 308].includes(e.status) && (e.headers.location || '').endsWith(esperado.eventoComPagina.caminho) || /http-equiv="refresh"[^>]*/.test(e.corpo) && e.corpo.includes(esperado.eventoComPagina.caminho), `${e.status} ${e.headers.location}`);
    }
    if (esperado.eventoSemPagina) {
      const e = await site.pedir(`/eventos/${esperado.eventoSemPagina}`);
      conferir('evento sem página própria abre a própria página, com dados estruturados Event', e.status === 200 && e.corpo.includes('"@type":"Event"'), e.status);
    }
    if (esperado.cruzado) {
      const a = await site.pedir(`/blog/${esperado.cruzado.evento}`);
      conferir('evento aberto por /blog/ vai para /eventos/', [307, 308].includes(a.status) && (a.headers.location || '').endsWith(`/eventos/${esperado.cruzado.evento}`), `${a.status} ${a.headers.location}`);
    }
    if (esperado.videoNaCapa) {
      const v = await site.pedir(`/blog/${esperado.videoNaCapa}`);
      conferir('vídeo na capa: miniatura do YouTube e botão, sem player', v.status === 200 && /i\.ytimg\.com\/vi\/[\w-]+\/hqdefault\.jpg/.test(v.corpo) && /video--capa/.test(v.corpo) && !/<iframe/.test(v.corpo), v.status);
      conferir('vídeo no corpo: mais de um botão de vídeo (capa e corpo)', (v.corpo.match(/class="video video--capa"/g) || []).length >= 2);
    }
    if (esperado.tituloComScript) {
      const t = await site.pedir(`/blog/${esperado.tituloComScript}`);
      const ldt = meta(t.corpo, /<script type="application\/ld\+json">(.*?)<\/script>/s) || '';
      conferir('título com </script>: página 200 e dados estruturados sem "<"', t.status === 200 && !ldt.includes('<') && ldt.includes('\\u003c/script'), t.status);
      conferir('título com </script>: nenhum <script> a mais na página', !/<script>alert\(1\)/.test(t.corpo));
    }

    const mapa = await site.pedir('/sitemap.xml');
    const l = locs(mapa.corpo);
    conferir('sitemap.xml traz as páginas do índice do Engine', l.includes('/blog') && l.includes('/eventos') && l.includes(`/blog/${esperado.materia}`) && l.includes(`/blog/categoria/${esperado.categoriaSlug}`), l.join(' '));

    const home = await site.pedir('/');
    conferir('home: bloco do Blog com as matérias mais recentes', /id="blog"/.test(home.corpo) && home.corpo.includes(esperado.tituloDaMateria), home.status);

    if (esperado.engine) {
      /* Custo (SPEC-SITE §11): a mesma matéria várias vezes em um minuto = uma chamada; endereço inventado = nenhuma. */
      const e = esperado.engine;
      const slugFora = esperado.materia === 'massa-fresca-na-manteiga-e-sage' ? 'materia-de-exemplo-6' : null;
      const antes = e.chamadas.length;
      for (let i = 0; i < 5; i++) await site.pedir('/blog/nao-existe');
      conferir('endereço inventado (/blog/nao-existe) → 404 sem chamada nova ao Engine', e.chamadas.length === antes, `${e.chamadas.length - antes} chamadas`);
      if (slugFora) {
        const antes2 = e.chamadas.length;
        for (let i = 0; i < 5; i++) await site.pedir(`/blog/${slugFora}`);
        const chamadasDaMateria = e.chamadas.slice(antes2).filter((c) => c === `/posts/${slugFora}`).length;
        conferir('a mesma matéria aberta 5 vezes → no máximo uma chamada ao Engine', chamadasDaMateria <= 1, `${chamadasDaMateria} chamadas`);
      }
    }
  } finally {
    site.parar();
  }
}

try {
  if (process.argv.includes('--so-staging') === false) {
    await fase1();
    const porta = await portaLivre();
    const engine = await subirEngine(porta, 'on');
    try {
      await fase2({ NEXT_PUBLIC_ENGINE_URL: `http://127.0.0.1:${porta}` }, 'Engine de mentira', {
        materia: 'massa-fresca-na-manteiga-e-sage',
        tituloDaMateria: 'Massa fresca na manteiga e sálvia',
        titulos: ['Massa fresca na manteiga e sálvia', 'Visita a um produtor, em vídeo'],
        categoria: /href="\/blog\/categoria\/receita-do-mes"[^>]*>Receita do mês/,
        categoriaSlug: 'receita-do-mes',
        tituloNaCategoria: 'Massa fresca na manteiga e sálvia',
        imagem: /\/capa\/massa-fresca-na-manteiga-e-sage\.jpg\?v=\w+$/,
        proximosEmOrdem: ['Degustação de azeites', 'Jantar Nicolini × Rustichella', 'Noite de vinhos do Sul'],
        eventoComPagina: { titulo: 'Rustichella', slug: 'jantar-nicolini-e-rustichella', caminho: '/rustichella' },
        eventoSemPagina: 'degustacao-de-azeites',
        cruzado: { evento: 'degustacao-de-azeites' },
        videoNaCapa: 'visita-a-um-produtor-em-video',
        tituloComScript: 'titulo-com-script',
        engine,
      });
    } finally {
      engine.servidor.close();
    }
  }

  /* Contra o staging local, se estiver no ar. */
  const staging = process.env.STAGING_ENGINE || 'http://127.0.0.1:3280';
  const casa = process.env.STAGING_CASA || 'bistro-teste';
  const vivo = await fetch(`${staging}/api/v1/public/restaurants/${casa}/blog/index`).then((r) => r.ok, () => false);
  if (!vivo) console.log(`\n(staging ${staging} fora do ar: verificação contra ele pulada)`);
  else {
    const indice = (await (await fetch(`${staging}/api/v1/public/restaurants/${casa}/blog/index`)).json()).data.items;
    const artigo = indice.find((i) => i.kind === 'article');
    const categorizado = (await (await fetch(`${staging}/api/v1/public/restaurants/${casa}/blog/posts?kind=article&limit=48`)).json()).data.items.find((i) => i.category);
    const comCategoria = categorizado;
    const eventos = (await (await fetch(`${staging}/api/v1/public/restaurants/${casa}/blog/posts?kind=event&limit=48`)).json()).data.items;
    const comPagina = eventos.find((e) => e.event.landingPath);
    const semPagina = eventos.find((e) => !e.event.landingPath);
    const dados = (await (await fetch(`${staging}/api/v1/public/restaurants/${casa}/blog/posts/${artigo.slug}`)).json()).data;
    await fase2({ NEXT_PUBLIC_ENGINE_URL: staging, NEXT_PUBLIC_ENGINE_CASA: casa }, `staging ${casa}`, {
      materia: artigo.slug,
      tituloDaMateria: dados.title,
      titulos: [dados.title],
      categoria: /categoria\//,
      categoriaSlug: comCategoria.category.slug,
      tituloNaCategoria: comCategoria.title,
      imagem: /./,
      eventoComPagina: comPagina && { titulo: comPagina.title, slug: comPagina.slug, caminho: comPagina.event.landingPath },
      eventoSemPagina: semPagina?.slug,
    });
  }
} catch (erro) {
  falhas++;
  console.error(erro);
}
writeFileSync(join(raiz, 'tsconfig.json'), tsconfig);
console.log(falhas ? `\n${falhas} falha(s).` : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
