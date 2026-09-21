import { Layout, Arrow, Redes } from '../components/Layout';
import { Balcoes } from '../components/Balcoes';
import { Reveal } from '../components/Reveal';
import { casa } from '../data/casa';

export default function Loja() {
  const { endereco } = casa;

  return (
    <Layout>
      <section className="band band--paper page-top">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">A loja física</p>
            <h1>
              Onde a seleção
              <br />
              ganha <em>endereço.</em>
            </h1>
            <p>
              No bairro Interlagos, em Caxias do Sul. Aqui estão os horários,
              os contatos e a rota para chegar com calma.
            </p>
          </Reveal>
        </div>
      </section>

      <Reveal className="loja__banner">
        <img src="/media/loja/queijaria.jpg" alt="Balcão da loja Nicolini" />
      </Reveal>

      <section className="band band--paper section">
        <div className="wrap loja__grid">
          <Reveal>
            <h2>Endereço</h2>
            <div className="prose">
              <address style={{ fontStyle: 'normal' }}>
                {endereco.linha1}
                <br />
                {endereco.bairro} · {endereco.cidade} · {endereco.estado}
                <br />
                CEP {endereco.cep}
              </address>
              <p>
                Abra a rota e chegue pelo caminho mais simples até a loja.
              </p>
              <a className="link" href={casa.mapsBusca} target="_blank" rel="noreferrer">
                Abrir no Google Maps <Arrow direction="upRight" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h2>Horários</h2>
            <dl className="horarios">
              {casa.horarios.map((item) => (
                <div key={item.dia} className={item.fechado ? 'is-fechado' : undefined}>
                  <dt>{item.dia}</dt>
                  <dd>{item.hora}</dd>
                </div>
              ))}
            </dl>
            <div className="prose" style={{ marginTop: 22 }}>
              <p>Em feriados, confirme o horário antes de sair.</p>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <h2>Contato</h2>
            <div className="prose">
              <p>
                Para uma encomenda, uma dúvida sobre um produto ou uma
                indicação para a mesa, fale com a casa.
              </p>
              <div>
                <a className="link" href={`tel:${casa.telefone.link}`}>
                  {casa.telefone.exibicao}
                </a>
              </div>
              <div>
                <a className="link" href={`mailto:${casa.email}`}>
                  {casa.email}
                </a>
              </div>
              <Redes comRotulo />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band band--ink section">
        <div className="wrap">
          <Reveal className="secao__head">
            <div>
              <p className="eyebrow">Nossos produtos</p>
              <h2>
                A casa tem muitos <em>caminhos.</em>
              </h2>
            </div>
            <p className="secao__head-nota">
              Cinco balcões, cada um organizado para escolher com contexto —
              pela origem, pela técnica e pelo prazer à mesa.
            </p>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <Balcoes />
        </Reveal>
      </section>

      <section className="mapa" aria-label="Mapa com a localização da loja">
        <iframe
          src={casa.mapsEmbed}
          title="Mapa com a localização da loja Nicolini"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="mapa__card">
          <p className="eyebrow">Como chegar</p>
          <address>
            {endereco.linha1}
            <br />
            {endereco.bairro} · {endereco.cidade}
          </address>
          <a className="link" href={casa.mapsBusca} target="_blank" rel="noreferrer">
            Traçar rota <Arrow direction="upRight" />
          </a>
        </div>
      </section>
    </Layout>
  );
}
