import type { PublicProductCardData } from '../engine/sdk-0.7.0/index.js';
import { dinheiro, gramas } from '../engine/formato';

/*
 * O preço numa linha própria (DESIGN-BRIEF §10). Por peso, o preço é do quilo
 * e o mínimo vem embaixo; sem preço, "Sob consulta". Indisponível mostra o
 * preço apagado: o produto continua no site, só não se pede agora.
 */
export function Preco({ produto, grande = false, nota = true }: { produto: PublicProductCardData; grande?: boolean; nota?: boolean }) {
  const classe = `preco ${grande ? 'preco--grande' : ''} ${produto.available ? '' : 'is-apagado'}`;
  if (produto.priceCents === null) {
    return (
      <p className={classe}>
        <span className="preco__valor">Sob consulta</span>
      </p>
    );
  }
  if (produto.saleMode === 'weight') {
    return (
      <p className={classe}>
        <span className="preco__valor">{dinheiro(produto.priceCents, produto.currency)}</span>
        <span className="preco__unidade"> o quilo</span>
        {nota && produto.minGrams ? <span className="preco__nota">A partir de {gramas(produto.minGrams)}</span> : null}
      </p>
    );
  }
  return (
    <p className={classe}>
      <span className="preco__valor">{dinheiro(produto.priceCents, produto.currency)}</span>
    </p>
  );
}
