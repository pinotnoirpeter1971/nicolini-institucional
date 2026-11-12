import Link from 'next/link';
import type { PublicProductCardData } from '../engine/sdk-0.7.0/index.js';
import { Foto } from './Foto';
import { Preco } from './Preco';
import { AcaoDoCartao } from './AcaoDoCartao';

/*
 * O cartão de produto do e-commerce, sem caixa, sombra, selo de desconto ou
 * parcelamento (DESIGN-BRIEF §10): foto numa moldura de proporção fixa, a
 * marca, o nome, a medida, o preço em linha própria e a ação.
 */
export function CartaoDeProduto({ produto, sizes = '(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 25vw' }: { produto: PublicProductCardData; sizes?: string }) {
  const href = `/produto/${produto.slug}`;
  return (
    <article className={`produto-cartao ${produto.available ? '' : 'is-indisponivel'}`}>
      <Link href={href} className="produto-cartao__foto" tabIndex={-1} aria-hidden="true">
        {produto.photo ? <Foto foto={produto.photo} sizes={sizes} /> : <span className="sem-foto">Nicolini</span>}
      </Link>
      <div className="produto-cartao__info">
        {produto.brand && <p className="produto-cartao__marca">{produto.brand}</p>}
        <h3>
          <Link href={href}>{produto.name}</Link>
        </h3>
        <p className="produto-cartao__medida">{produto.saleMode === 'weight' ? 'Vendido por peso' : produto.sizeLabel}</p>
        <Preco produto={produto} />
        <AcaoDoCartao produto={produto} />
      </div>
    </article>
  );
}
