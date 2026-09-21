import { useArrasto } from './Balcoes';
import { galeria } from '../data/bistro';

/*
 * A faixa de fotos do bistro: varios quadrados lado a lado, sempre passando da
 * largura da tela. E o mesmo trilho dos balcoes — mesma rolagem nativa com
 * snap, mesmo arrasto de mouse — só que aqui a foto e o assunto inteiro, entao
 * nao ha texto, legenda nem contador: uma legenda so faria sentido se houvesse
 * uma foto em foco, e aqui ha sempre varias visiveis ao mesmo tempo.
 */
export function GaleriaBistro() {
  const trilho = useArrasto();

  return (
    <div
      className="rail rail--galeria"
      ref={trilho}
      role="group"
      aria-label="Fotos do Bistrô Nicolini"
    >
      {galeria.map((foto) => (
        <figure className="galeria__item" key={foto.src}>
          <img src={foto.src} alt={foto.alt} loading="lazy" draggable="false" />
        </figure>
      ))}
    </div>
  );
}
