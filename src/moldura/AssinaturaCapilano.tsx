/*
 * A assinatura da Capilano: uma linha discreta na ponta direita da faixa legal
 * do rodapé, com o símbolo ao lado. O símbolo usa a cor do texto
 * (currentColor), então a cor fica no CSS (`.capilano`, em moldura-rodape.css).
 */
const SIMBOLO =
  'M 260.1071,56.071367 239.88577,76.292572 219.66449,56.071367 239.88577,35.850168 Z M 0,204.02089 l 20.221325,-20.20674 20.22132,20.20674 -20.22132,20.23608 z M 206.33912,0 l -56.07155,56.071367 73.98936,73.974973 -73.98936,73.98902 56.07155,56.07178 h -40.42807 l -35.8648,-35.86505 -35.850164,35.86505 H 53.76802 L 109.83952,204.03536 35.850209,130.04634 109.83952,56.071367 53.76802,0 H 94.196086 L 130.04625,35.850168 165.91105,0 Z m -76.29287,76.278112 -53.767976,53.768228 53.767976,53.76781 53.78261,-53.76781 z m 89.61824,127.742778 20.22128,-20.20674 20.22133,20.20674 -20.22133,20.23608 z M 0,56.071367 20.221325,35.850168 40.442645,56.071367 20.221325,76.292572 0,56.071367';

export function AssinaturaCapilano() {
  return (
    <p className="capilano">
      <svg viewBox="0 0 260.11 260.11" aria-hidden="true" focusable="false">
        <path fill="currentColor" fillRule="evenodd" d={SIMBOLO} />
      </svg>
      <span>
        Desenvolvido sob medida pela{" "}
        <a href="https://capilanocreative.com" target="_blank" rel="noopener">Capilano</a>
      </span>
    </p>
  );
}
