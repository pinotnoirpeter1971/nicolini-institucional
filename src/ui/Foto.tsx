import type { PublicMediaData } from '../engine/sdk-0.7.0/index.js';

/*
 * Foto do Engine (SPEC-SITE §5): <img> comum, com as larguras que o Engine já
 * entrega (srcset), dimensões declaradas (a página não pula), carregamento
 * adiado fora da primeira dobra e o ponto de foco aplicado no recorte. A
 * moldura de cada uso fixa a proporção no CSS (§5 do DESIGN-BRIEF). Sem o
 * otimizador da Vercel: os derivados já existem.
 */
export function Foto({
  foto,
  sizes,
  prioridade = false,
  className,
}: {
  foto: PublicMediaData;
  sizes: string;
  prioridade?: boolean;
  className?: string;
}) {
  const foco = `${Math.round(foto.focus.x * 100)}% ${Math.round(foto.focus.y * 100)}%`;
  if (foto.kind === 'video') {
    return <img className={className} src={foto.poster} alt={foto.alt} width={foto.width} height={foto.height} loading={prioridade ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: foco }} />;
  }
  const srcSet = foto.sources.length ? foto.sources.map((s) => `${s.url} ${s.width}w`).join(', ') : undefined;
  return (
    <img
      className={className}
      src={foto.url}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={foto.alt}
      width={foto.width}
      height={foto.height}
      loading={prioridade ? 'eager' : 'lazy'}
      fetchPriority={prioridade ? 'high' : undefined}
      decoding="async"
      style={{ objectPosition: foco }}
    />
  );
}
