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
import { Busca, Coracao, Pessoa, Pin } from '../components/Icons';

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

/* PROVISÓRIO (demonstração, 12/11/2026; Pedro desfaz depois): formulário GET que leva a
 * /produtos?busca=<termo>; a página filtra por nome e marca. Sem rede aqui, sem dado guardado. */
export function CampoDeBusca() {
  return (
    <form className="cabecalho__busca" role="search" action="/produtos" method="get">
      <Busca />
      <input type="search" name="busca" placeholder="Busque produtos, marcas e origens" aria-label="Buscar produtos" autoComplete="off" required />
    </form>
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
