import Link from 'next/link';
import type { PublicProductCardData, PublicProductCategoryData, PublicProductData } from '../engine/sdk-0.7.0/index.js';
import { gramas } from '../engine/formato';
import { setores } from '../data/casa';
import { modulos } from '../menu-do-site';
import { Arrow } from '../components/Icons';
import { Reveal } from '../components/Reveal';
import { CartaoDeProduto } from '../ui/CartaoDeProduto';
import { Migalhas } from '../ui/Migalhas';
import { MaisProdutos } from '../ui/VerMais';
import { Galeria } from '../ui/Galeria';
import { Comprar } from '../ui/Comprar';
import { Preco } from '../ui/Preco';
import { casa } from '../data/casa';

/*
 * Produtos, categoria e produto: o desenho do e-commerce (departamentos,
 * cabeçalho e grade da categoria, página de produto), refeito com os tokens do
 * site. Os dados chegam prontos da página (servidor), no formato do SDK.
 */

/* As categorias do Engine não têm foto; as cinco que são balcões da loja usam a
 * foto do balcão (src/data/casa.js). Categoria nova fica sem foto até ganhar uma. */
export function fotoDaCategoria(slug: string) {
  const setor = setores.find((s) => s.categoria === slug);
  return setor ? { src: setor.foto, alt: setor.nome } : null;
}

function ComoFunciona() {
  if (!modulos.pedidos) return null;
  return (
    <section className="como-funciona" aria-labelledby="como-funciona">
      <div className="wrap">
        <p className="eyebrow" id="como-funciona">
          Como funciona o pedido
        </p>
        <ol>
          <li>
            <b>Monte a sacola.</b> Escolha os produtos e as quantidades; por peso, em gramas.
          </li>
          <li>
            <b>Envie pelo WhatsApp.</b> O site prepara a mensagem com o seu pedido para a loja.
          </li>
          <li>
            <b>A loja confirma.</b> Disponibilidade, peso e valor final são acertados por lá. Nada é pago no site.
          </li>
        </ol>
      </div>
    </section>
  );
}

export function PaginaDeProdutos({ categorias, destaques }: { categorias: PublicProductCategoryData[]; destaques: PublicProductCardData[] }) {
  const total = categorias.reduce((s, c) => s + c.count, 0);
  return (
    <>
      <section className="topo-de-pagina topo-de-pagina--suave">
        <div className="wrap">
          <Migalhas itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Produtos' }]} />
          <Reveal className="topo-de-pagina__texto">
            <p className="eyebrow">Nossos produtos</p>
            <h1>
              Tudo o que a casa
              <br />
              escolhe, <em>por aqui.</em>
            </h1>
            <p>Uma porta de entrada para os ingredientes, produtores e ocasiões que fazem parte da nossa seleção.</p>
          </Reveal>
        </div>
      </section>

      <section className="diretorio wrap" aria-labelledby="todas-as-categorias">
        <div className="diretorio__cabeca">
          <p className="eyebrow" id="todas-as-categorias">
            Todas as categorias
          </p>
          <p>
            {total} produtos em {categorias.length} categorias
          </p>
        </div>
        <ul>
          {categorias.map((c, i) => {
            const foto = fotoDaCategoria(c.slug);
            return (
              <li key={c.slug}>
                <Link href={`/produtos/${c.slug}`} className="diretorio__linha">
                  <span className="diretorio__numero">{String(i + 1).padStart(2, '0')}</span>
                  <span className="diretorio__nome">{c.name}</span>
                  <span className="diretorio__descricao">{c.description}</span>
                  <span className="diretorio__contagem">
                    {c.count} {c.count === 1 ? 'produto' : 'produtos'}
                  </span>
                  <span className="diretorio__foto">{foto && <img src={foto.src} alt="" width="1200" height="1500" loading="lazy" decoding="async" />}</span>
                  <Arrow />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {destaques.length > 0 && (
        <section className="section secao-destaques" aria-labelledby="destaques">
          <div className="wrap">
            <div className="cabeca-de-secao">
              <div>
                <p className="eyebrow">Seleção da semana</p>
                <h2 id="destaques">
                  O que a casa
                  <br />
                  <em>recomenda.</em>
                </h2>
              </div>
            </div>
            <div className="grade-de-produtos grade-de-produtos--quatro">
              {destaques.map((p) => (
                <CartaoDeProduto key={p.id} produto={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ComoFunciona />
    </>
  );
}

export function PaginaDaCategoria({
  categoria,
  categorias,
  itens,
  cursor,
  limite,
}: {
  categoria: PublicProductCategoryData;
  categorias: PublicProductCategoryData[];
  itens: PublicProductCardData[];
  cursor: string | null;
  limite: number;
}) {
  const foto = fotoDaCategoria(categoria.slug);
  return (
    <>
      <section className="topo-de-pagina topo-de-pagina--suave topo-de-categoria">
        <div className="wrap topo-de-categoria__grade">
          <div>
            <Migalhas itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Produtos', href: '/produtos' }, { rotulo: categoria.name }]} />
            <h1>{categoria.name}</h1>
            {categoria.description && <p>{categoria.description}</p>}
          </div>
          {foto && (
            <div className="topo-de-categoria__foto">
              <img src={foto.src} alt={foto.alt} width="1200" height="1500" fetchPriority="high" decoding="async" />
            </div>
          )}
        </div>
      </section>

      <nav className="categorias-atalho" aria-label="Outras categorias">
        <ul className="wrap">
          {categorias.map((c) => (
            <li key={c.slug}>
              <Link href={`/produtos/${c.slug}`} aria-current={c.slug === categoria.slug ? 'page' : undefined}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="catalogo wrap" aria-label={`Produtos de ${categoria.name}`}>
        <p className="catalogo__contagem">
          {itens.length ? `${categoria.count} ${categoria.count === 1 ? 'produto' : 'produtos'} na seleção` : 'Nenhum produto agora'}
        </p>
        {itens.length ? (
          <div className="grade-de-produtos">
            {itens.map((p) => (
              <CartaoDeProduto key={p.id} produto={p} />
            ))}
            <MaisProdutos categoria={categoria.slug} cursor={cursor} limite={limite} />
          </div>
        ) : (
          <div className="vazio">
            <span className="vazio__marca" aria-hidden="true">
              N
            </span>
            <h2>
              Nenhum produto
              <br />
              nesta <em>seleção agora.</em>
            </h2>
            <p>Algumas escolhas não ficam muito tempo na prateleira. Veja as outras categorias ou fale com a casa: podemos ajudar a encontrar.</p>
            <div className="acoes">
              <Link className="botao botao--escuro" href="/produtos">
                Ver todas as categorias <Arrow />
              </Link>
              <a className="link" href={`https://wa.me/${casa.whatsapp.link}`} target="_blank" rel="noreferrer">
                Fale com a casa <Arrow direction="upRight" />
              </a>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export function PaginaDoProduto({ produto, relacionados }: { produto: PublicProductData; relacionados: PublicProductCardData[] }) {
  const linhaDeCima = [produto.brand, produto.origin].filter(Boolean).join(' · ');
  const conversa = (texto: string) => `https://wa.me/${casa.whatsapp.link}?text=${encodeURIComponent(texto)}`;
  return (
    <>
      <section className="produto wrap">
        <Migalhas
          itens={[
            { rotulo: 'Início', href: '/' },
            { rotulo: produto.category.name, href: `/produtos/${produto.category.slug}` },
            { rotulo: produto.name },
          ]}
        />
        <div className="produto__grade">
          <Galeria fotos={produto.photos} nome={produto.name} />

          <div className="produto__compra">
            {linhaDeCima && <p className="eyebrow">{linhaDeCima}</p>}
            <h1>{produto.name}</h1>
            <p className="produto__medida">
              {produto.saleMode === 'weight' ? `Vendido por peso${produto.minGrams ? `, a partir de ${gramas(produto.minGrams)}` : ''}` : produto.sizeLabel}
            </p>
            <Preco produto={produto} grande nota={false} />
            {produto.description && <p className="produto__descricao">{produto.description}</p>}

            {!produto.available ? (
              <div className="aviso aviso--estado">
                <p>
                  <b>Indisponível no momento.</b> O produto continua na seleção da casa, mas não pode ser pedido agora.
                </p>
                <a className="link" href={conversa(`Olá! O ${produto.name} vai voltar?`)} target="_blank" rel="noreferrer">
                  Perguntar à casa <Arrow direction="upRight" />
                </a>
              </div>
            ) : produto.priceCents === null ? (
              <div className="aviso aviso--estado">
                <p>
                  <b>Sob consulta.</b> O valor e a disponibilidade deste produto são combinados direto com a casa.
                </p>
                <a className="botao botao--escuro" href={conversa(`Olá! Quero saber do ${produto.name}.`)} target="_blank" rel="noreferrer">
                  Consultar pelo WhatsApp <Arrow direction="upRight" />
                </a>
              </div>
            ) : modulos.pedidos ? (
              <Comprar produto={produto} />
            ) : (
              <a className="botao botao--escuro" href={conversa(`Olá! Quero pedir ${produto.name}.`)} target="_blank" rel="noreferrer">
                Pedir pelo WhatsApp <Arrow direction="upRight" />
              </a>
            )}

            {modulos.pedidos && produto.available && produto.priceCents !== null && (
              <div className="produto__como">
                <p>
                  <b>Como funciona o pedido.</b> Você monta a sacola e envia pelo WhatsApp. A loja confirma disponibilidade, peso e valor final por lá;
                  nada é pago no site.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {relacionados.length > 0 && (
        <section className="section relacionados" aria-labelledby="relacionados">
          <div className="wrap">
            <div className="cabeca-de-secao">
              <div>
                <p className="eyebrow">Pode combinar com</p>
                <h2 id="relacionados">
                  Outras escolhas
                  <br />
                  <em>da casa.</em>
                </h2>
              </div>
              <Link className="link" href={`/produtos/${produto.category.slug}`}>
                Ver {produto.category.name.toLowerCase()} <Arrow />
              </Link>
            </div>
            <div className="grade-de-produtos grade-de-produtos--quatro">
              {relacionados.map((p) => (
                <CartaoDeProduto key={p.id} produto={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
