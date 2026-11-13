import sharp from 'sharp';
import { indiceDoBlog, materia as lerMateria } from '../../../src/engine/fonte';
import { LARGURA_DA_CAPA, fotoDaCapa } from '../../../src/metadados';
import { siteUrl } from '../../../src/site';

/*
 * /capa/<slug>.jpg: a capa da matéria (ou do evento) em JPEG, no domínio do
 * site, para a miniatura do link no WhatsApp. O Engine só entrega WebP (no
 * r2.dev), e o WhatsApp não mostra prévia de WebP. O endereço leva ?v=<capa>
 * (src/metadados.ts), então a CDN guarda por um ano: capa nova, endereço novo.
 */
export async function GET(_: Request, { params }: { params: Promise<{ arquivo: string }> }) {
  const slug = (await params).arquivo.replace(/\.jpg$/, '');
  const indice = await indiceDoBlog();
  const m = indice?.some((x) => x.slug === slug) ? await lerMateria(slug) : null;
  const foto = m ? fotoDaCapa(m.cover) : null;
  if (!foto) return new Response('Sem capa', { status: 404 });

  const origem = await fetch(new URL(foto.fonte, siteUrl));
  if (!origem.ok) return new Response('Capa indisponível', { status: 502 });
  const jpeg = await sharp(Buffer.from(await origem.arrayBuffer()))
    .resize({ width: LARGURA_DA_CAPA, withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400',
    },
  });
}
