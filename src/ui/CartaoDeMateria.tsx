import Link from 'next/link';
import { youtubeThumbnail, type BlogCardData, type BlogCoverData } from '../engine/sdk-0.7.0/index.js';
import { dataPorExtenso, diaEMes, periodo } from '../engine/formato';
import { Arrow, Play } from '../components/Icons';
import { Foto } from './Foto';

/** A página própria do evento (a Rustichella), só se for um caminho do próprio site: `//x` e `/\x` saem do site. */
export function caminhoDaPaginaPropria(evento: BlogCardData['event']) {
  const caminho = evento?.landingPath;
  return caminho && /^\/(?![/\\])/.test(caminho) ? caminho : null;
}

/*
 * Capa de reserva para evento com página própria e sem capa no Engine: a
 * imagem de compartilhamento da própria página. A capa do painel, quando
 * existir, tem precedência.
 */
const CAPAS_DAS_PAGINAS_PROPRIAS: Record<string, { src: string; largura: number; altura: number }> = {
  '/rustichella': { src: '/media/rustichella/og-rustichella.jpg', largura: 1200, altura: 630 },
};

/** Para onde o cartão leva: a matéria, o evento ou, com página própria, direto a ela (DESIGN-BRIEF §9). */
export function enderecoDaMateria(m: Pick<BlogCardData, 'kind' | 'slug' | 'event'>) {
  if (m.kind === 'event') return caminhoDaPaginaPropria(m.event) || `/eventos/${m.slug}`;
  return `/blog/${m.slug}`;
}

/*
 * A capa no cartão: foto, ou a imagem do vídeo com o sinal de reprodução. O
 * player nunca carrega no cartão; quem clica vai à matéria. Capa de vídeo sem
 * foto própria usa a miniatura do YouTube (uma imagem, sem script e sem cookie).
 */
export function CapaNoCartao({ capa, sizes, prioridade = false }: { capa: BlogCoverData | null; sizes: string; prioridade?: boolean }) {
  if (!capa) return <span className="sem-foto">Nicolini</span>;
  if (capa.type === 'photo') return <Foto foto={capa.photo} sizes={sizes} prioridade={prioridade} />;
  return (
    <>
      {capa.photo ? (
        <Foto foto={capa.photo} sizes={sizes} prioridade={prioridade} />
      ) : (
        <img src={youtubeThumbnail(capa.videoId)} alt="" width={480} height={360} loading={prioridade ? 'eager' : 'lazy'} decoding="async" />
      )}
      <span className="selo-video" aria-hidden="true">
        <Play />
      </span>
    </>
  );
}

export function CartaoDeMateria({
  materia,
  destaque = false,
  sizes = '(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw',
}: {
  materia: BlogCardData;
  destaque?: boolean;
  sizes?: string;
}) {
  const href = enderecoDaMateria(materia);
  const video = materia.cover?.type === 'video';
  return (
    <article className={`materia-cartao ${destaque ? 'materia-cartao--destaque' : ''}`}>
      <Link href={href} className="materia-cartao__capa" tabIndex={-1} aria-hidden="true">
        <CapaNoCartao capa={materia.cover} sizes={destaque ? '(max-width: 760px) 100vw, 58vw' : sizes} prioridade={destaque} />
      </Link>
      <div className="materia-cartao__texto">
        <p className="eyebrow">
          {materia.category?.name ?? 'Blog Nicolini'}
          {video && <span className="materia-cartao__tipo"> · Vídeo</span>}
        </p>
        <h3>
          <Link href={href}>{materia.title}</Link>
        </h3>
        <p className="materia-cartao__resumo">{materia.excerpt}</p>
        <p className="materia-cartao__meta">
          {dataPorExtenso(materia.date)} · {materia.readingMinutes} min de leitura
        </p>
      </div>
    </article>
  );
}

export function CartaoDeEvento({ evento, passado = false }: { evento: BlogCardData; passado?: boolean }) {
  const href = enderecoDaMateria(evento);
  const quando = evento.event!;
  const { dia, mes } = diaEMes(quando.startsOn);
  const propria = caminhoDaPaginaPropria(quando);
  const paginaPropria = Boolean(propria);
  const capaDeReserva = !evento.cover && propria ? CAPAS_DAS_PAGINAS_PROPRIAS[propria] : undefined;
  return (
    <article className={`evento-cartao ${passado ? 'is-passado' : ''}`}>
      <Link href={href} className="evento-cartao__capa" tabIndex={-1} aria-hidden="true">
        {capaDeReserva ? (
          <img src={capaDeReserva.src} alt="" width={capaDeReserva.largura} height={capaDeReserva.altura} loading="lazy" decoding="async" />
        ) : (
          <CapaNoCartao capa={evento.cover} sizes="(max-width: 760px) 100vw, 40vw" />
        )}
        <span className="evento-cartao__data" aria-hidden="true">
          <b>{dia}</b>
          {mes}
        </span>
      </Link>
      <div className="evento-cartao__texto">
        <p className="eyebrow">{passado ? 'Realizado' : 'Próximo'} · {quando.place}</p>
        <h3>
          <Link href={href}>{evento.title}</Link>
        </h3>
        <p className="evento-cartao__quando">{periodo(quando.startsOn, quando.endsOn)}</p>
        <p className="materia-cartao__resumo">{evento.excerpt}</p>
        <Link href={href} className="link">
          {paginaPropria ? 'Abrir a página do evento' : passado ? 'Como foi' : 'Saiba mais'} <Arrow />
        </Link>
      </div>
    </article>
  );
}
