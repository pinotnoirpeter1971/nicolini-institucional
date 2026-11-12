'use client';

import { useState } from 'react';
import { youtubeEmbedUrl, youtubeThumbnail, type PublicMediaData } from '../engine/sdk-0.7.0/index.js';
import { Play } from '../components/Icons';
import { Foto } from './Foto';

/*
 * Vídeo do YouTube (SPEC-SITE §5): antes do clique, só uma imagem com o botão
 * de reprodução; a única coisa pedida ao YouTube é a miniatura, e nem isso
 * quando há foto própria. O player entra no clique, pelo youtube-nocookie, com
 * título, proporção fixa e só as permissões de que precisa.
 */
export function VideoDoYoutube({
  videoId,
  titulo,
  foto = null,
  sizes = '(max-width: 760px) 100vw, 800px',
  prioridade = false,
}: {
  videoId: string;
  titulo: string;
  foto?: PublicMediaData | null;
  sizes?: string;
  prioridade?: boolean;
}) {
  const [tocando, setTocando] = useState(false);
  if (tocando) {
    return (
      <div className="video">
        <iframe
          src={`${youtubeEmbedUrl(videoId)}?autoplay=1&rel=0`}
          title={titulo}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }
  return (
    <button type="button" className="video video--capa" onClick={() => setTocando(true)} aria-label={`Assistir ao vídeo: ${titulo}`}>
      {foto ? (
        <Foto foto={foto} sizes={sizes} prioridade={prioridade} />
      ) : (
        <img src={youtubeThumbnail(videoId)} alt="" width={480} height={360} loading={prioridade ? 'eager' : 'lazy'} decoding="async" />
      )}
      <span className="video__play" aria-hidden="true">
        <Play />
      </span>
      <span className="video__rotulo" aria-hidden="true">
        Assistir
      </span>
    </button>
  );
}
