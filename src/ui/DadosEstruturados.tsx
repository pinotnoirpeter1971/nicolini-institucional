import type { PublicProductData } from '../engine/sdk-0.7.0/index.js';
import { siteUrl } from '../site';

/*
 * Dados estruturados do produto (SPEC-SITE §4): `Product`, com oferta só no
 * produto por unidade e com preço. Por peso não leva oferta, para não anunciar
 * um preço que não é o final. O `<` é escapado: um nome com `</script>` não
 * fecha o bloco.
 */
export function dadosEstruturadosDoProduto(p: PublicProductData): string {
  const foto = p.photos[0];
  const dados: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    url: `${siteUrl}/produto/${p.slug}`,
    ...(p.description ? { description: p.description } : {}),
    ...(foto ? { image: foto.kind === 'image' ? foto.url : foto.poster } : {}),
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    ...(p.saleMode === 'unit' && p.priceCents !== null
      ? {
          offers: {
            '@type': 'Offer',
            price: (p.priceCents / 100).toFixed(2),
            priceCurrency: p.currency,
            availability: p.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${siteUrl}/produto/${p.slug}`,
          },
        }
      : {}),
  };
  return JSON.stringify(dados).replace(/</g, '\\u003c');
}
