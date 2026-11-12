import { redes } from '../data/casa';
import { IconeRede } from '../components/Icons';

/* As redes da casa, com o traçado fino dos ícones do site (antes em Layout.jsx). */
export function Redes({ comRotulo = false }) {
  return (
    <ul className={`redes ${comRotulo ? 'redes--rotulo' : ''}`}>
      {redes.map((rede) => (
        <li key={rede.id}>
          <a href={rede.href} target="_blank" rel="noreferrer" aria-label={rede.rotulo}>
            <IconeRede nome={rede.icone} />
            {comRotulo && <span>{rede.exibicao}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
