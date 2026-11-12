/*
 * PEÇAS DE LOJA COMPLETA (DESIGN-BRIEF §6, SPEC-SITE §8). Decisão de Pedro em
 * 12/11/2026: as do header do e-commerce ficam À VISTA, MAS TRAVADAS (ver
 * `pecasDeLoja` em src/menu-do-site.ts). Travada quer dizer: botão ou campo
 * desativado (`aria-disabled` ou `disabled`), sem link para página que não
 * existe, sem chamar rede e sem guardar nada. "Em breve" no título explica a
 * quem passar o mouse. As de fora do header (newsletter, selos) continuam
 * apagadas. A função de cada uma pede spec próprio.
 */
import { textoDaFaixa } from '../menu-do-site';
import { Busca, Coracao, Menu, Pessoa, Pin } from '../components/Icons';

const EM_BREVE = 'Em breve';

export function FaixaDeAnuncio() {
  return (
    <div className="faixa-de-anuncio" role="note">
      <span className="faixa-de-anuncio__ponto" aria-hidden="true" />
      <span>{textoDaFaixa}</span>
      <button type="button" className="faixa-de-anuncio__cep" aria-disabled="true" title={EM_BREVE}>
        Informe seu CEP <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

export function CampoDeBusca() {
  return (
    <div className="cabecalho__busca" role="search" title={EM_BREVE}>
      <Busca />
      <input type="search" placeholder="Busque produtos, marcas e origens" aria-label="Buscar produtos (em breve)" disabled />
    </div>
  );
}

export function BotaoCep() {
  return (
    <button type="button" className="cabecalho__cep" aria-disabled="true" title={EM_BREVE}>
      <Pin />
      <span>
        <small>Receba em</small>
        <b>Informe seu CEP</b>
      </span>
    </button>
  );
}

export function IconeConta({ comRotulo = false }: { comRotulo?: boolean }) {
  return (
    <button type="button" className={comRotulo ? 'cabecalho__travado' : 'cabecalho__icone'} aria-disabled="true" aria-label="Sua conta (em breve)" title={EM_BREVE}>
      {comRotulo ? 'Minha conta' : <Pessoa />}
    </button>
  );
}

export function IconeCurtidos({ comRotulo = false }: { comRotulo?: boolean }) {
  return (
    <button type="button" className={comRotulo ? 'cabecalho__travado' : 'cabecalho__icone'} aria-disabled="true" aria-label="Curtidos (em breve)" title={EM_BREVE}>
      {comRotulo ? 'Curtidos' : <Coracao />}
    </button>
  );
}

/* O gatilho do mega menu de departamentos: as categorias vêm do Engine, que o
 * layout não chama, então o menu não abre (DESIGN-BRIEF §6). */
export function BotaoDepartamentos() {
  return (
    <button type="button" className="cabecalho__departamentos" aria-disabled="true" title={EM_BREVE}>
      <Menu /> Departamentos
    </button>
  );
}

export function Newsletter() {
  return (
    <section className="newsletter">
      <div className="wrap newsletter__linha">
        <div>
          <p className="eyebrow">Newsletter Nicolini</p>
          <h2>
            Receba as novidades
            <br />
            da <em>casa.</em>
          </h2>
        </div>
        <div>
          <label htmlFor="newsletter-email">Seu e-mail</label>
          <input id="newsletter-email" type="email" placeholder="nome@exemplo.com" disabled />
        </div>
      </div>
    </section>
  );
}

export function SelosDePagamento() {
  return (
    <section className="rodape__pagamentos" aria-label="Formas de pagamento">
      <p className="eyebrow">Pagamentos</p>
      <ul>
        {['Visa', 'Mastercard', 'Elo', 'American Express', 'Pix'].map((nome) => (
          <li key={nome}>{nome}</li>
        ))}
      </ul>
    </section>
  );
}
