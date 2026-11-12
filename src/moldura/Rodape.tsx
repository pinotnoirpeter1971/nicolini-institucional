import Link from 'next/link';
import { casa } from '../data/casa';
import { itensAcesos, lojaFisica, menuPrincipal, modulos, pecasDeLoja, todosOsProdutos } from '../menu-do-site';
import { Arrow } from '../components/Icons';
import { Newsletter, SelosDePagamento } from './Guardadas';
import { Redes } from './Redes';

/*
 * O rodapé do e-commerce, em cinco colunas, com os dados reais do site no ar
 * (src/data/casa.js). Newsletter e selos de pagamento ficam guardados.
 */
export function Rodape() {
  const { endereco } = casa;
  const links = [...itensAcesos([{ ...todosOsProdutos, rotulo: 'Produtos' }]), ...itensAcesos(menuPrincipal), lojaFisica];

  return (
    <footer className="rodape">
      {pecasDeLoja.newsletter !== 'apagada' && <Newsletter />}
      <div className="wrap rodape__topo">
        <Link href="/" className="rodape__marca">
          {casa.marca}
        </Link>
        <p className="rodape__frase">{casa.descricao}.</p>
        <a href="#topo" className="rodape__voltar">
          Voltar ao início <Arrow direction="upRight" />
        </a>
      </div>

      <div className="wrap rodape__colunas">
        <section>
          <p className="eyebrow">Fale com a casa</p>
          <a href={`https://wa.me/${casa.whatsapp.link}`} target="_blank" rel="noreferrer">
            WhatsApp {casa.whatsapp.exibicao}
          </a>
          <a href={`tel:${casa.telefone.link}`}>{casa.telefone.exibicao}</a>
          <a href={`mailto:${casa.email}`}>{casa.email}</a>
        </section>

        <section>
          <p className="eyebrow">Endereço</p>
          <address>
            {endereco.linha1}
            <br />
            {endereco.bairro} · {endereco.cidade} · {endereco.estado}
            <br />
            CEP {endereco.cep}
          </address>
          <a className="rodape__rota" href={casa.mapsBusca} target="_blank" rel="noreferrer">
            Como chegar <Arrow direction="upRight" />
          </a>
        </section>

        <section>
          <p className="eyebrow">Horários</p>
          <dl className="rodape__horarios">
            {casa.horarios.map((h) => (
              <div key={h.dia} className={h.fechado ? 'is-fechado' : undefined}>
                <dt>{h.dia}</dt>
                <dd>{h.hora}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <p className="eyebrow">Nicolini</p>
          {links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.rotulo}
            </Link>
          ))}
          {modulos.privacidade && <Link href="/politica-de-privacidade">Política de privacidade</Link>}
        </section>

        <section>
          <p className="eyebrow">Siga a casa</p>
          <Redes />
        </section>
      </div>

      <div className="wrap rodape__legal">
        {pecasDeLoja.selosDePagamento !== 'apagada' && <SelosDePagamento />}
        <p>
          {casa.razaoSocial} · CNPJ {casa.cnpj}
        </p>
        <p>Endereço, contato e CNPJ obtidos de registros públicos.</p>
      </div>
    </footer>
  );
}
