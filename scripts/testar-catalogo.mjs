#!/usr/bin/env node
/*
 * Teste do catálogo (Produtos) em build de produção, em dois cenários:
 *  1. casa SEM Produtos (`nicolini` no Engine de staging, que responde 404):
 *     páginas 404, fora do menu e do sitemap;
 *  2. casa COM Produtos (`bistro-teste` no staging): as páginas mostram o dado
 *     do Engine, o sitemap traz o índice, endereço inventado é 404 sem chamada
 *     nova ao Engine, e a saída do build mostra as rotas como guardadas (ISR).
 * Precisa do Engine de staging em ENGINE_STAGING (padrão http://127.0.0.1:3280).
 * Cada cenário faz o próprio build em .next-catalogo-*, sem tocar no .next.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { request } from 'node:http';
import { dirname, join } from 'node:path';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const staging = (process.env.ENGINE_STAGING || 'http://127.0.0.1:3280').replace(/\/$/, '');
const next = join(raiz, 'node_modules', '.bin', 'next');
/* O `next build` acrescenta a pasta de cada build ao tsconfig.json; o teste devolve o arquivo como estava. */
const tsconfig = readFileSync(join(raiz, 'tsconfig.json'), 'utf8');

let falhas = 0;
let total = 0;
const conferir = (nome, ok, detalhe = '') => {
  total++;
  if (ok) console.log(`  ok    ${nome}`);
  else {
    falhas++;
    console.log(`  FALHA ${nome}${detalhe ? `  (${detalhe})` : ''}`);
  }
};

const portaLivre = () =>
  new Promise((ok, no) => {
    const s = createServer();
    s.once('error', no);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });

function pedir(porta, caminho) {
  return new Promise((ok, no) => {
    const req = request({ host: '127.0.0.1', port: porta, path: caminho, headers: { 'accept-encoding': 'identity' } }, (res) => {
      let corpo = '';
      res.setEncoding('utf8');
      res.on('data', (d) => (corpo += d));
      res.on('end', () => ok({ status: res.statusCode, corpo }));
    });
    req.on('error', no);
    req.setTimeout(20000, () => req.destroy(new Error(`tempo esgotado em ${caminho}`)));
    req.end();
  });
}

/* Conta as chamadas que o servidor do site faz ao Engine: um proxy contador na frente do staging. */
async function proxyContador() {
  const alvo = new URL(staging);
  const chamadas = [];
  const porta = await portaLivre();
  const { createServer: http } = await import('node:http');
  const srv = http((req, res) => {
    chamadas.push(req.url);
    const up = request({ host: alvo.hostname, port: alvo.port, path: req.url, method: req.method, headers: { ...req.headers, host: alvo.host } }, (r) => {
      res.writeHead(r.statusCode, r.headers);
      r.pipe(res);
    });
    up.on('error', () => res.writeHead(502).end());
    req.pipe(up);
  });
  await new Promise((ok) => srv.listen(porta, '127.0.0.1', ok));
  return { url: `http://127.0.0.1:${porta}`, chamadas, fechar: () => srv.close() };
}

async function cenario(nome, casa, engineUrl, verificar) {
  console.log(`\n${nome}`);
  const dist = `.next-catalogo-${casa}`;
  const env = { ...process.env, NEXT_DIST_DIR: dist, NEXT_PUBLIC_ENGINE_CASA: casa, NEXT_PUBLIC_ENGINE_URL: engineUrl };
  delete env.NEXT_PUBLIC_SITE_DADOS;
  /* Assíncrono: o proxy contador mora neste processo e precisa responder durante o build. */
  const build = await new Promise((ok) => {
    const p = spawn(next, ['build'], { cwd: raiz, env });
    let saida = '';
    p.stdout.on('data', (d) => (saida += d));
    p.stderr.on('data', (d) => (saida += d));
    p.on('close', (status) => ok({ status, stdout: saida }));
  });
  writeFileSync(join(raiz, 'tsconfig.json'), tsconfig);
  conferir('next build passa', build.status === 0, build.stdout.slice(-400));
  if (build.status !== 0) return;
  const porta = await portaLivre();
  const servidor = spawn(next, ['start', '--hostname', '127.0.0.1', '--port', String(porta)], { cwd: raiz, env, stdio: 'ignore' });
  try {
    for (let i = 0; i < 100; i++) {
      try { await pedir(porta, '/robots.txt'); break; } catch { await new Promise((r) => setTimeout(r, 200)); }
    }
    await verificar({ porta, saidaDoBuild: build.stdout });
  } finally {
    servidor.kill('SIGTERM');
    rmSync(join(raiz, dist), { recursive: true, force: true });
    writeFileSync(join(raiz, 'tsconfig.json'), tsconfig);
  }
}

/* O staging precisa estar de pé. */
try {
  const r = await fetch(`${staging}/api/v1/public/restaurants/bistro-teste/products/index`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
} catch (e) {
  console.error(`Engine de staging fora do ar em ${staging} (${e.message}). Suba-o ou use ENGINE_STAGING.`);
  process.exit(1);
}

await cenario('Casa sem Produtos (nicolini): tudo escondido', 'nicolini', staging, async ({ porta }) => {
  for (const c of ['/produtos', '/produtos/queijos', '/produto/queijo-serrano']) {
    const r = await pedir(porta, c);
    conferir(`${c} → 404 com a página do site`, r.status === 404 && r.corpo.includes('Página não encontrada'), `veio ${r.status}`);
  }
  const home = await pedir(porta, '/');
  conferir('/ sem Produtos no menu', !/href="\/produtos/.test(home.corpo));
  const sm = await pedir(porta, '/sitemap.xml');
  conferir('sitemap.xml só com as páginas fixas', !/\/produto/.test(sm.corpo));
});

const proxy = await proxyContador();
try {
  await cenario('Casa com Produtos (bistro-teste): o dado do Engine', 'bistro-teste', proxy.url, async ({ porta, saidaDoBuild }) => {
    /* A saída lista a rota e, abaixo, os caminhos gerados (●) ou o ƒ de função por visita. */
    const linhas = saidaDoBuild.split('\n');
    for (const rota of ['/produtos', '/produtos/[categoria]', '/produto/[slug]']) {
      const i = linhas.findIndex((l) => l.includes(` ${rota}`) && /[├└┌]/.test(l));
      const bloco = [linhas[i], ...linhas.slice(i + 1).filter((l) => /^[│ ]/.test(l) && !/^[├└]/.test(l))].join(' ');
      conferir(`build: ${rota} é guardada (não dinâmica)`, i >= 0 && /[●○]/.test(bloco) && !bloco.includes('ƒ'), bloco.trim());
    }
    const prod = await pedir(porta, '/produtos');
    conferir('/produtos → 200 com as categorias do Engine', prod.status === 200 && /Queijos/.test(prod.corpo) && /Azeites/.test(prod.corpo) && /Vinhos/.test(prod.corpo), `${prod.status} ${[...prod.corpo.matchAll(/diretorio__nome">([^<]*)/g)].map((m) => m[1])}`);
    const cat = await pedir(porta, '/produtos/queijos');
    conferir('/produtos/queijos → 200 com os produtos e a contagem', cat.status === 200 && /Grana Padano 18 meses/.test(cat.corpo) && /Queijo Serrano/.test(cat.corpo) && /5 produtos/.test(cat.corpo));
    const peso = await pedir(porta, '/produto/queijo-serrano');
    conferir('produto por peso: preço por quilo, mínimo e título/descrição no HTML', peso.status === 200 && /R\$\s*129,00/.test(peso.corpo) && /o quilo/.test(peso.corpo) && /150 g/.test(peso.corpo) && /<title>Queijo Serrano — Nicolini<\/title>/.test(peso.corpo));
    conferir('produto por peso sem oferta estruturada', /"@type":"Product"/.test(peso.corpo) && !/"@type":"Offer"/.test(peso.corpo));
    const un = await pedir(porta, '/produto/azeite-extra-virgem-portugues');
    conferir('produto por unidade: preço e oferta estruturada', un.status === 200 && /R\$\s*89,90/.test(un.corpo) && /"@type":"Offer"[^}]*"price":"89.90"/.test(un.corpo));
    const indisp = await pedir(porta, '/produto/taleggio');
    conferir('produto indisponível: aviso e nenhuma ação de adicionar', indisp.status === 200 && /Indisponível no momento/.test(indisp.corpo) && !/Adicionar à sacola/.test(indisp.corpo));
    const consulta = await pedir(porta, '/produto/vinho-barolo-riserva');
    conferir('produto sob consulta: aviso e nenhuma ação de adicionar', consulta.status === 200 && /Sob consulta/.test(consulta.corpo) && !/Adicionar à sacola/.test(consulta.corpo));
    conferir('slugs que colidem com rota do Engine (categories, index) abrem', (await pedir(porta, '/produto/categories')).status === 200 && (await pedir(porta, '/produto/index')).status === 200);

    /* Custo: abrir a mesma página várias vezes e inventar endereços não gera chamada nova. */
    await pedir(porta, '/produto/nao-existe'); // aquece o índice
    const antes = proxy.chamadas.length;
    for (let i = 0; i < 5; i++) await pedir(porta, '/produto/queijo-serrano');
    for (const c of ['/produto/inventado-1', '/produto/inventado-2', '/produtos/inventada']) {
      const r = await pedir(porta, c);
      conferir(`${c} → 404`, r.status === 404, `veio ${r.status}`);
    }
    conferir('páginas guardadas e endereços inventados: nenhuma chamada nova ao Engine', proxy.chamadas.length === antes, proxy.chamadas.slice(antes).join(' '));

    const sm = await pedir(porta, '/sitemap.xml');
    const locs = [...sm.corpo.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    conferir('sitemap.xml traz as páginas e produtos do índice', ['/produtos', '/produtos/queijos', '/produto/queijo-serrano', '/produto/taleggio'].every((p) => locs.includes(p)), locs.join(' '));
  });
} finally {
  proxy.fechar();
}

console.log(`\n${total - falhas}/${total} verificações passaram${falhas ? `, ${falhas} falharam` : ''}.`);
process.exit(falhas ? 1 : 0);
