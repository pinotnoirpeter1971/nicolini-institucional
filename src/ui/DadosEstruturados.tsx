import { youtubeThumbnail, type BlogPostData } from '../engine/sdk-0.7.0/index.js';
import { siteUrl } from '../site';
import { descricaoDaMateria } from './descricao';

/*
 * Dados estruturados da matéria (BlogPosting) e do evento (Event), SPEC-SITE
 * §4. O `<` sai escapado: um título com `</script>` não fecha o bloco.
 */
function imagemDaMateria(m: BlogPostData) {
  const capa = m.cover;
  if (!capa) return undefined;
  if (capa.photo) return capa.photo.kind === 'image' ? capa.photo.url : capa.photo.poster;
  return capa.type === 'video' ? youtubeThumbnail(capa.videoId) : undefined;
}

export function DadosEstruturados({ materia }: { materia: BlogPostData }) {
  const evento = materia.kind === 'event' ? materia.event : null;
  const url = `${siteUrl}/${evento ? 'eventos' : 'blog'}/${materia.slug}`;
  const comum = { name: materia.title, description: descricaoDaMateria(materia), image: imagemDaMateria(materia), url };
  const dados = evento
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        ...comum,
        startDate: evento.startsOn,
        endDate: evento.endsOn ?? evento.startsOn,
        location: { '@type': 'Place', name: evento.place },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: materia.title,
        description: descricaoDaMateria(materia),
        image: comum.image,
        datePublished: materia.publishedAt,
        dateModified: materia.updatedAt,
        mainEntityOfPage: url,
        publisher: { '@type': 'Organization', name: 'Nicolini' },
      };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, '\\u003c') }} />;
}
