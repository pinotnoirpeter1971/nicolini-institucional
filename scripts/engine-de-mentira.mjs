#!/usr/bin/env node
/*
 * Engine de mentira, SÓ PARA TESTE: responde a leitura pública do Blog
 * (SPEC-BLOG §4) com dados de exemplo, no formato do SDK. Serve a
 * scripts/testar-blog.mjs e as capturas de tela da trilha do Blog. Nada daqui
 * vai ao ar: o site de produção lê o Engine de verdade.
 *
 *   node scripts/engine-de-mentira.mjs [porta]      (PORT, FOTOS e MODO também valem)
 *
 * Controle: GET /__modo?valor=on|off|erro  (off = Blog desligado, 404 em tudo;
 * erro = 500) e GET /__contagem (as chamadas recebidas, para provar o cache).
 * As fotos apontam para FOTOS (padrão http://127.0.0.1:5184/media/blog/…).
 */
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

const DIA = 86400000;
const em = (dias) => new Date(Date.now() + dias * DIA).toISOString().slice(0, 10);

export function criarEngineDeMentira({ fotos = 'http://127.0.0.1:5184', modo = 'on' } = {}) {
  const foto = (arquivo, w, h, alt) => ({
    kind: 'image',
    url: `${fotos}/media/blog/${arquivo}`,
    width: w,
    height: h,
    alt,
    focus: { x: 0.5, y: 0.5 },
    sources: [{ url: `${fotos}/media/blog/${arquivo}`, width: w }],
  });
  const paragrafo = (id, ...texto) => ({ id, type: 'paragraph', text: texto });
  const cestas = foto('cestas.jpg', 1000, 1500, 'Cestas com massas e conservas');
  const massas = foto('massas.jpg', 1166, 1500, 'Massa fresca sobre a bancada');

  const base = (o) => ({ cover: null, category: null, event: null, excerpt: '', readingMinutes: 1, blocks: [], ...o });
  const receita = { slug: 'receita-do-mes', name: 'Receita do mês' };
  const posts = [
    base({
      id: 'a1', kind: 'article', slug: 'massa-fresca-na-manteiga-e-sage', title: 'Massa fresca na manteiga e sálvia',
      excerpt: 'Três ingredientes e dez minutos: a receita do mês da casa.', date: em(-1), category: receita, readingMinutes: 3,
      cover: { type: 'photo', photo: massas },
      blocks: [
        paragrafo('b1', { text: 'Uma massa simples pede ' }, { text: 'ingredientes bons', bold: true }, { text: ' e pouca pressa. ' }, { text: 'Veja a loja', href: 'https://www.emporionicolini.com.br/a-loja' }, { text: '.' }),
        { id: 'b2', type: 'heading', text: 'O que você precisa' },
        { id: 'b3', type: 'photo', photo: cestas, caption: 'Tudo o que entra na panela.' },
        { id: 'b4', type: 'quote', text: 'A manteiga só precisa dourar, nunca queimar.', source: 'Cozinha da casa' },
        paragrafo('b5', { text: 'Escorra a massa e termine na frigideira.' }),
      ],
      publishedAt: `${em(-1)}T12:00:00.000Z`, updatedAt: `${em(-1)}T12:00:00.000Z`,
    }),
    base({
      id: 'a2', kind: 'article', slug: 'visita-a-um-produtor-em-video', title: 'Visita a um produtor, em vídeo',
      excerpt: 'Acompanhe a colheita e o queijo saindo da forma.', date: em(-3), readingMinutes: 2,
      cover: { type: 'video', videoId: 'dQw4w9WgXcQ', photo: null },
      blocks: [
        paragrafo('c1', { text: 'Gravamos a visita inteira.' }),
        { id: 'c2', type: 'youtube', videoId: '9bZkp7q19f0', caption: 'A colheita.' },
      ],
      publishedAt: `${em(-3)}T12:00:00.000Z`, updatedAt: `${em(-3)}T12:00:00.000Z`,
    }),
    base({
      id: 'a3', kind: 'article', slug: 'titulo-com-script', title: 'Truque </script><script>alert(1)</script> da casa',
      excerpt: 'Título que tenta fechar o script.', date: em(-4),
      blocks: [paragrafo('d1', { text: 'Texto comum.' })],
      publishedAt: `${em(-4)}T12:00:00.000Z`, updatedAt: `${em(-4)}T12:00:00.000Z`,
    }),
    ...Array.from({ length: 6 }, (_, i) =>
      base({
        id: `f${i}`, kind: 'article', slug: `materia-de-exemplo-${i + 1}`, title: `Matéria de exemplo ${i + 1}`,
        excerpt: 'Só para preencher a lista.', date: em(-10 - i), category: i % 2 ? null : receita,
        blocks: [paragrafo(`g${i}`, { text: 'Corpo.' })],
        publishedAt: `${em(-10 - i)}T12:00:00.000Z`, updatedAt: `${em(-10 - i)}T12:00:00.000Z`,
      }),
    ),
    ...[
      ['e1', 'jantar-nicolini-e-rustichella', 'Jantar Nicolini × Rustichella', 20, null, '/rustichella', 'Salão do Bistrô', massas],
      ['e2', 'degustacao-de-azeites', 'Degustação de azeites', 5, 6, null, 'Empório', cestas],
      ['e3', 'noite-de-vinhos-do-sul', 'Noite de vinhos do Sul', -30, null, null, 'Bistrô', null],
      ['e4', 'feira-de-queijos', 'Feira de queijos', -60, -59, null, 'Varanda', null],
      ...Array.from({ length: 6 }, (_, i) => [`h${i}`, `encontro-antigo-${i + 1}`, `Encontro antigo ${i + 1}`, -100 - i * 10, null, null, 'Empório', null]),
    ].map(([id, slug, title, ini, fim, landing, place, capa]) =>
      base({
        id, kind: 'event', slug, title, excerpt: 'Um encontro em volta da mesa.', date: em(ini),
        event: { startsOn: em(ini), endsOn: fim === null ? null : em(fim), place, landingPath: landing },
        cover: capa ? { type: 'photo', photo: capa } : null,
        blocks: [paragrafo(`i${id}`, { text: 'Como será o encontro.' })],
        publishedAt: `${em(-5)}T12:00:00.000Z`, updatedAt: `${em(-5)}T12:00:00.000Z`,
      }),
    ),
  ];
  const cartao = (p) => {
    const { blocks, publishedAt, updatedAt, ...c } = p;
    return c;
  };
  const chamadas = [];
  const estado = { modo };

  const servidor = createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const enviar = (status, corpo) => {
      res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
      res.end(JSON.stringify(corpo));
    };
    if (url.pathname === '/__modo') {
      estado.modo = url.searchParams.get('valor') || 'on';
      return enviar(200, { modo: estado.modo });
    }
    if (url.pathname === '/__contagem') return enviar(200, { chamadas });
    const m = url.pathname.match(/^\/api\/v1\/public\/restaurants\/[^/]+\/blog(\/.*)?$/);
    if (!m) return enviar(404, { error: { code: 'NOT_FOUND', message: 'Não encontrado.' } });
    chamadas.push(m[1] || '/');
    if (estado.modo === 'erro') return enviar(500, { error: { code: 'ERRO', message: 'Falha.' } });
    if (estado.modo === 'off') return enviar(404, { error: { code: 'NOT_FOUND', message: 'Não encontrado.' } });
    const rota = m[1];
    if (rota === '/index') return enviar(200, { data: { items: posts.map((p) => ({ kind: p.kind, slug: p.slug, updatedAt: p.updatedAt })) } });
    if (rota === '/categories') {
      const n = posts.filter((p) => p.kind === 'article' && p.category?.slug === receita.slug).length;
      return enviar(200, { data: { items: [{ ...receita, count: n }] } });
    }
    if (rota === '/posts') {
      const q = url.searchParams;
      const hoje = em(0);
      let lista = posts.filter((p) => p.kind === q.get('kind'));
      if (q.get('category')) lista = lista.filter((p) => p.category?.slug === q.get('category'));
      if (q.get('when')) lista = lista.filter((p) => ((p.event.endsOn ?? p.event.startsOn) >= hoje) === (q.get('when') === 'upcoming'));
      if (q.get('kind') === 'event' && q.get('when') === 'upcoming') lista.sort((a, b) => a.event.startsOn.localeCompare(b.event.startsOn));
      else lista.sort((a, b) => b.date.localeCompare(a.date));
      const ini = Number(q.get('cursor')) || 0;
      const limite = Math.min(Number(q.get('limit')) || 12, 48);
      return enviar(200, { data: { items: lista.slice(ini, ini + limite).map(cartao), nextCursor: ini + limite < lista.length ? String(ini + limite) : null } });
    }
    const um = rota?.match(/^\/posts\/([^/]+)$/);
    const achado = um && posts.find((p) => p.slug === decodeURIComponent(um[1]));
    if (achado) return enviar(200, { data: achado });
    return enviar(404, { error: { code: 'NOT_FOUND', message: 'Não encontrado.' } });
  });
  return { servidor, chamadas, estado, posts };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const porta = Number(process.argv[2] || process.env.PORT || 3281);
  const { servidor } = criarEngineDeMentira({ fotos: process.env.FOTOS || 'http://127.0.0.1:5184', modo: process.env.MODO || 'on' });
  servidor.listen(porta, '127.0.0.1', () => console.log(`Engine de mentira em http://127.0.0.1:${porta}`));
}
