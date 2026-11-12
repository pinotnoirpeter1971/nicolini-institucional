import Link from 'next/link';
import type { BlogBlockData, BlogRunData } from '../engine/sdk-0.7.0/index.js';
import { siteUrl } from '../site';
import { Foto } from './Foto';
import { VideoDoYoutube } from './VideoDoYoutube';

/*
 * O corpo da matéria, bloco a bloco (SPEC-BLOG): parágrafo, intertítulo, foto
 * com legenda, citação e vídeo. Conteúdo do Engine nunca vira HTML: texto é
 * texto, e um link só vira `href` se começar com https://, http://, mailto: ou
 * tel: (SPEC-SITE §9). Link para o próprio site vira navegação interna.
 */
const PERMITIDOS = /^(https:\/\/|http:\/\/|mailto:|tel:)/i;
const doSite = new RegExp(`^${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=/|$)`, 'i');

function Trecho({ trecho }: { trecho: BlogRunData }) {
  let conteudo: React.ReactNode = trecho.text;
  if (trecho.italic) conteudo = <em>{conteudo}</em>;
  if (trecho.bold) conteudo = <strong>{conteudo}</strong>;
  if (trecho.href && PERMITIDOS.test(trecho.href)) {
    const interno = trecho.href.replace(doSite, '');
    if (interno.startsWith('/')) return <Link href={interno}>{conteudo}</Link>;
    return (
      <a href={trecho.href} target="_blank" rel="noopener noreferrer">
        {conteudo}
      </a>
    );
  }
  return <>{conteudo}</>;
}

export function Blocos({ blocos }: { blocos: BlogBlockData[] }) {
  return (
    <>
      {blocos.map((bloco) => {
        switch (bloco.type) {
          case 'paragraph':
            return (
              <p key={bloco.id}>
                {bloco.text.map((t, i) => (
                  <Trecho key={i} trecho={t} />
                ))}
              </p>
            );
          case 'heading':
            return <h2 key={bloco.id}>{bloco.text}</h2>;
          case 'photo':
            return (
              <figure key={bloco.id} className="materia__figura">
                <Foto foto={bloco.photo} sizes="(max-width: 760px) 100vw, 760px" />
                {bloco.caption && <figcaption>{bloco.caption}</figcaption>}
              </figure>
            );
          case 'quote':
            return (
              <blockquote key={bloco.id} className="materia__citacao">
                <p>{bloco.text}</p>
                {bloco.source && <cite>{bloco.source}</cite>}
              </blockquote>
            );
          case 'youtube':
            return (
              <figure key={bloco.id} className="materia__figura materia__figura--video">
                <VideoDoYoutube videoId={bloco.videoId} titulo={bloco.caption || 'Vídeo da matéria'} />
                {bloco.caption && <figcaption>{bloco.caption}</figcaption>}
              </figure>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
