'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RestaurantsOrderError,
  orderRefusalLines,
  type OrderCurrentLineData,
  type OrderRejectedItem,
  type PublicOrderConfigData,
} from '../engine/sdk-0.7.0/index.js';
import { configDePedidos, enviarPedido } from '../engine/navegador';
import { dinheiro, gramas } from '../engine/formato';
import { casa } from '../data/casa';
import { modulos } from '../menu-do-site';
import { Alerta, Arrow } from '../components/Icons';
import { Migalhas } from '../ui/Migalhas';
import { limites } from '../ui/Quantidade';
import { esvaziar, substituir, type LinhaGuardada } from './armazem';
import { esquecerTentativa, lembrarPedido, tentativaPara } from './aparelho';
import { LinhaDaSacola } from './LinhaDaSacola';
import { useLinhasDaSacola, type Linha } from './linhas';
import { FRASE_DO_ESTIMADO } from './PainelDaSacola';

/*
 * A sacola e o envio do pedido (SPEC-SITE §7), sobretudo no celular. Linhas,
 * total estimado, aviso da casa, nome e observação, e "Enviar pedido". Recusa
 * com motivo atualiza a sacola com as linhas da resposta e pede confirmação;
 * falha deixa a sacola como está e oferece falar com a loja.
 */

type Mudancas = {
  porLinha: Record<string, string>;
  sairam: Array<{ nome: string; motivo: string }>;
  totalAntes: number;
};
type Falha = { tipo: 'pausada' | 'limite' | 'falha'; minutos?: number };

const MOTIVO: Record<OrderRejectedItem['why'], string> = {
  gone: 'saiu do site',
  unavailable: 'ficou indisponível',
  no_price: 'ficou sob consulta',
  quantity: 'a quantidade mudou de regra',
};

/* Quantidade dentro da regra atual (passo, mínimo e teto), a mais próxima da pedida. */
function ajustar(q: number, regra: Pick<OrderRejectedItem, 'saleMode' | 'stepGrams' | 'minGrams'>) {
  const { passo, minimo, maximo } = limites({ saleMode: regra.saleMode ?? 'unit', stepGrams: regra.stepGrams ?? null, minGrams: regra.minGrams ?? null });
  return Math.min(maximo, Math.max(minimo, Math.round(q / passo) * passo));
}

const precoDaLinha = (l: { saleMode: 'unit' | 'weight'; unitPriceCents: number }) =>
  l.saleMode === 'weight' ? `${dinheiro(l.unitPriceCents)} o quilo` : dinheiro(l.unitPriceCents);

export function PaginaDaSacola() {
  const router = useRouter();
  const s = useLinhasDaSacola();
  const [config, setConfig] = useState<PublicOrderConfigData | null | 'carregando' | 'erro'>('carregando');
  const [nome, setNome] = useState('');
  const [nota, setNota] = useState('');
  const [erros, setErros] = useState<{ nome?: string; nota?: string }>({});
  const [estado, setEstado] = useState<'parado' | 'enviando'>('parado');
  const [mudancas, setMudancas] = useState<Mudancas | null>(null);
  const [falha, setFalha] = useState<Falha | null>(null);
  const campoNome = useRef<HTMLInputElement>(null);
  const campoNota = useRef<HTMLTextAreaElement>(null);
  const caixaDeAviso = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let vivo = true;
    configDePedidos()
      .then((c) => vivo && setConfig(c))
      .catch(() => vivo && setConfig('erro'));
    return () => {
      vivo = false;
    };
  }, []);

  /* O cliente mexeu na sacola depois de uma recusa: as marcas de "mudou" saem. */
  const chave = s.linhas.map((l) => `${l.id}:${l.q}`).join(',');
  const chaveDaMudanca = useRef<string | null>(null);
  useEffect(() => {
    if (mudancas && chaveDaMudanca.current !== null && chave !== chaveDaMudanca.current) setMudancas(null);
  }, [chave, mudancas]);

  const limitesDoNome = typeof config === 'object' && config ? config.limits : { customerNameMin: 2, customerName: 120, note: 500 };
  const pausada = typeof config === 'object' && config !== null && !config.accepting;
  const semPedidos = config === null;
  const vazia = s.linhas.length === 0;
  const podeEnviar = !vazia && !s.carregando && !s.erro && s.bloqueadas.length === 0 && !pausada && !semPedidos && config !== 'carregando';

  const resumoDoBloqueio = useMemo(() => {
    if (s.bloqueadas.length === 0) return null;
    const n = s.bloqueadas.length;
    return n === 1 ? 'Um item não pode ser pedido agora: tire-o da sacola para enviar.' : `${n} itens não podem ser pedidos agora: tire-os da sacola para enviar.`;
  }, [s.bloqueadas.length]);

  function validar() {
    const novo: typeof erros = {};
    const n = nome.trim();
    if (n.length < limitesDoNome.customerNameMin) novo.nome = 'Escreva o seu nome, para a loja saber de quem é o pedido.';
    else if (n.length > limitesDoNome.customerName) novo.nome = `Use até ${limitesDoNome.customerName} caracteres.`;
    if (nota.length > limitesDoNome.note) novo.nota = `A observação passou de ${limitesDoNome.note} caracteres.`;
    setErros(novo);
    if (novo.nome) campoNome.current?.focus();
    else if (novo.nota) campoNota.current?.focus();
    return !novo.nome && !novo.nota;
  }

  function aplicarRecusa(err: RestaurantsOrderError, antes: Linha[], totalAntes: number) {
    const det = orderRefusalLines(err);
    if (!det) return false;
    const porLinha: Record<string, string> = {};
    const sairam: Mudancas['sairam'] = [];
    const atuais: OrderCurrentLineData[] = [...det.lines];
    const guardadas: LinhaGuardada[] = det.lines.map((l) => ({ id: l.productId, q: l.quantity }));
    for (const r of det.rejected ?? []) {
      const velha = antes.find((l) => l.id === r.productId);
      const nomeDoItem = velha?.produto?.name ?? 'Um item';
      if (r.why === 'quantity' && r.saleMode && r.unitPriceCents !== undefined && velha) {
        const q = ajustar(velha.q, r);
        guardadas.push({ id: r.productId, q });
        atuais.push({
          productId: r.productId, name: nomeDoItem, brand: velha.produto?.brand ?? null, saleMode: r.saleMode, sizeLabel: velha.produto?.sizeLabel ?? null,
          stepGrams: r.stepGrams ?? null, minGrams: r.minGrams ?? null, unitPriceCents: r.unitPriceCents, quantity: q, lineTotalCents: 0,
        });
        porLinha[r.productId] = `Quantidade ajustada para ${r.saleMode === 'weight' ? gramas(q) : q}: ${r.message}`;
      } else {
        sairam.push({ nome: nomeDoItem, motivo: MOTIVO[r.why] });
      }
    }
    for (const l of det.lines) {
      const velha = antes.find((x) => x.id === l.productId);
      if (velha?.produto?.priceCents != null && velha.produto.priceCents !== l.unitPriceCents)
        porLinha[l.productId] = `Preço mudou: de ${precoDaLinha({ saleMode: l.saleMode, unitPriceCents: velha.produto.priceCents })} para ${precoDaLinha(l)}.`;
    }
    s.aplicarLinhasAtuais(atuais);
    /* Mantém a ordem em que o cliente montou a sacola. */
    const ordem = new Map(antes.map((l, i) => [l.id, i]));
    guardadas.sort((a, b) => (ordem.get(a.id) ?? 99) - (ordem.get(b.id) ?? 99));
    chaveDaMudanca.current = guardadas.map((l) => `${l.id}:${l.q}`).join(',');
    substituir(guardadas);
    setMudancas({ porLinha, sairam, totalAntes });
    return true;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (estado === 'enviando' || !podeEnviar) return;
    if (!validar()) return;
    setFalha(null);
    const itens = s.linhas.map((l) => ({ productId: l.id, quantity: l.q }));
    const customerName = nome.trim();
    const note = nota.trim() || null;
    /* Chave e token nascem juntos e ficam guardados ANTES de chamar o Engine. */
    const assinatura = JSON.stringify([itens, customerName, note]);
    const { idempotencyKey, token } = tentativaPara(assinatura);
    const antes = s.linhas;
    const totalAntes = s.totalCents;
    setEstado('enviando');
    try {
      const recibo = await enviarPedido({ idempotencyKey, token, customerName, note, items: itens, expectedTotalCents: totalAntes });
      lembrarPedido({ numero: recibo.number, token, data: recibo.createdAt });
      esquecerTentativa();
      esvaziar();
      try {
        sessionStorage.setItem('nicolini:recem-enviado', token);
      } catch {
        /* sem armazenamento: o recibo só não tenta abrir o WhatsApp sozinho */
      }
      router.push(`/pedido#${token}`);
      return;
    } catch (err) {
      setEstado('parado');
      if (err instanceof RestaurantsOrderError) {
        if (aplicarRecusa(err, antes, totalAntes)) {
          requestAnimationFrame(() => caixaDeAviso.current?.focus());
          return;
        }
        if (err.reason === 'idempotency_mismatch' || err.reason === 'token_in_use') {
          esquecerTentativa();
          setFalha({ tipo: 'falha' });
        } else if (err.reason === 'not_accepting') setFalha({ tipo: 'pausada' });
        else if (err.status === 429) setFalha({ tipo: 'limite', minutos: err.retryAfterSeconds ? Math.max(1, Math.ceil(err.retryAfterSeconds / 60)) : undefined });
        else setFalha({ tipo: 'falha' });
      } else setFalha({ tipo: 'falha' });
      requestAnimationFrame(() => caixaDeAviso.current?.focus());
    }
  }

  const contato = `https://wa.me/${casa.whatsapp.link}`;
  const totalTexto = s.carregando ? '…' : dinheiro(s.totalCents);

  return (
    <div className="sacola-pagina">
      <section className="wrap sacola-pagina__cabeca">
        <Migalhas itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Sacola' }]} />
        <p className="eyebrow">Sua seleção</p>
        <h1>
          O que vai
          <br />
          para <em>a mesa.</em>
        </h1>
      </section>

      {vazia && !mudancas ? (
        <section className="wrap">
          <div className="vazio">
            <span className="vazio__marca" aria-hidden="true">
              N
            </span>
            <h2>
              A sua sacola
              <br />
              está <em>esperando.</em>
            </h2>
            <p>Comece por uma das seleções da casa. O pedido é enviado pelo WhatsApp, e a loja confirma tudo por lá.</p>
            {s.saiuDoSite > 0 && <p className="aviso aviso--suave">Os itens que estavam aqui saíram do site.</p>}
            <div className="acoes">
              <Link className="botao botao--escuro" href="/produtos">
                Explorar produtos <Arrow />
              </Link>
              <Link className="link" href="/pedido">
                Pedidos feitos neste aparelho <Arrow />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <form className="wrap sacola-pagina__grade" id="form-pedido" onSubmit={enviar} noValidate>
          <div className="sacola-pagina__linhas">
            {(mudancas || falha || pausada || s.saiuDoSite > 0 || s.erro) && (
              <div className="sacola-pagina__avisos" ref={caixaDeAviso} tabIndex={-1}>
                {mudancas && (
                  <div className="aviso aviso--mudou" role="alert">
                    <Alerta />
                    <div>
                      <p>
                        <b>A sacola mudou desde que você a montou.</b> Confira o que mudou e o total novo antes de enviar.
                      </p>
                      {mudancas.sairam.length > 0 && (
                        <ul>
                          {mudancas.sairam.map((x) => (
                            <li key={x.nome}>
                              {x.nome} {x.motivo} e saiu da sacola.
                            </li>
                          ))}
                        </ul>
                      )}
                      {!vazia && (
                        <p className="aviso__total">
                          Total estimado: <s>{dinheiro(mudancas.totalAntes)}</s> <b>{totalTexto}</b>
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {falha && (
                  <div className="aviso aviso--estado" role="alert">
                    <Alerta />
                    <div>
                      <p>
                        {falha.tipo === 'pausada' && (
                          <>
                            <b>A casa pausou os pedidos pelo site agora.</b> Sua sacola continua aqui. Para pedir já, fale com a loja.
                          </>
                        )}
                        {falha.tipo === 'limite' && (
                          <>
                            <b>Muitos pedidos saíram daqui em pouco tempo.</b> Tente de novo {falha.minutos ? `em ${falha.minutos} ${falha.minutos === 1 ? 'minuto' : 'minutos'}` : 'mais tarde'}, ou fale com a loja.
                          </>
                        )}
                        {falha.tipo === 'falha' && (
                          <>
                            <b>Não foi possível enviar agora.</b> Sua sacola continua aqui: tente de novo em instantes, ou fale com a loja.
                          </>
                        )}
                      </p>
                      <p className="acoes">
                        <a className="link" href={contato} target="_blank" rel="noreferrer">
                          WhatsApp da loja {casa.whatsapp.exibicao} <Arrow direction="upRight" />
                        </a>
                        <a className="link" href={`tel:${casa.telefone.link}`}>
                          {casa.telefone.exibicao}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                {pausada && !falha && (
                  <div className="aviso aviso--estado" role="status">
                    <Alerta />
                    <div>
                      <p>
                        <b>A casa não está recebendo pedidos pelo site agora.</b> Sua sacola fica guardada aqui. Para pedir já, fale com a loja.
                      </p>
                      <p className="acoes">
                        <a className="link" href={contato} target="_blank" rel="noreferrer">
                          WhatsApp da loja {casa.whatsapp.exibicao} <Arrow direction="upRight" />
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                {s.saiuDoSite > 0 && (
                  <p className="aviso aviso--suave" role="status">
                    {s.saiuDoSite === 1 ? 'Um item saiu do site e foi tirado da sacola.' : `${s.saiuDoSite} itens saíram do site e foram tirados da sacola.`}
                  </p>
                )}
                {s.erro && (
                  <div className="aviso aviso--estado" role="alert">
                    <Alerta />
                    <div>
                      <p>
                        <b>Não foi possível conferir os preços agora.</b> A sacola continua guardada.
                      </p>
                      <button type="button" className="link" onClick={s.tentarDeNovo}>
                        Tentar de novo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!vazia && (
              <ul className="linhas linhas--pagina">
                {s.linhas.map((l) => (
                  <LinhaDaSacola key={l.id} linha={l} mudou={mudancas?.porLinha[l.id]} travada={estado === 'enviando'} />
                ))}
              </ul>
            )}
            {resumoDoBloqueio && <p className="sacola-pagina__bloqueio">{resumoDoBloqueio}</p>}
            {vazia && mudancas && (
              <div className="vazio vazio--compacto">
                <p>Nenhum item da sacola pode ser pedido agora.</p>
                <Link className="botao botao--escuro" href="/produtos">
                  Explorar produtos <Arrow />
                </Link>
              </div>
            )}
          </div>

          {!vazia && (
            <aside className="resumo" aria-labelledby="resumo-titulo">
              <p className="eyebrow" id="resumo-titulo">
                Resumo do pedido
              </p>
              <div className="total total--grande">
                <span>Total estimado</span>
                <strong aria-live="polite">{totalTexto}</strong>
              </div>
              <p className="total__nota">{FRASE_DO_ESTIMADO}</p>
              {typeof config === 'object' && config?.notice && (
                <p className="resumo__aviso-da-casa">
                  <b>Aviso da casa.</b> {config.notice}
                </p>
              )}

              {!pausada && !semPedidos && (
                <fieldset className="resumo__campos" disabled={estado === 'enviando'}>
                  <legend className="sr-only">Seus dados para o pedido</legend>
                  <div className={`campo ${erros.nome ? 'is-erro' : ''}`}>
                    <label htmlFor="pedido-nome">Seu nome</label>
                    <input
                      id="pedido-nome"
                      ref={campoNome}
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      autoComplete="name"
                      maxLength={limitesDoNome.customerName}
                      aria-invalid={Boolean(erros.nome)}
                      aria-describedby={erros.nome ? 'pedido-nome-erro' : undefined}
                      required
                    />
                    {erros.nome && (
                      <p className="campo__erro" id="pedido-nome-erro">
                        {erros.nome}
                      </p>
                    )}
                  </div>
                  <div className={`campo ${erros.nota ? 'is-erro' : ''}`}>
                    <label htmlFor="pedido-nota">
                      Observação <span>(opcional)</span>
                    </label>
                    <textarea
                      id="pedido-nota"
                      ref={campoNota}
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      rows={3}
                      placeholder="Ex.: jamón fatiado bem fino"
                      aria-invalid={Boolean(erros.nota)}
                      aria-describedby={`pedido-nota-conta${erros.nota ? ' pedido-nota-erro' : ''}`}
                    />
                    <p className="campo__conta" id="pedido-nota-conta">
                      {nota.length}/{limitesDoNome.note}
                    </p>
                    {erros.nota && (
                      <p className="campo__erro" id="pedido-nota-erro">
                        {erros.nota}
                      </p>
                    )}
                  </div>
                  <p className="resumo__privacidade">
                    O nome e a observação vão só para a loja atender este pedido.
                    {modulos.privacidade && (
                      <>
                        {' '}
                        <Link href="/politica-de-privacidade">Política de privacidade</Link>.
                      </>
                    )}
                  </p>
                </fieldset>
              )}

              {!pausada && !semPedidos ? (
                <button type="submit" className="botao botao--marca botao--largo resumo__enviar" disabled={!podeEnviar || estado === 'enviando'} aria-busy={estado === 'enviando'}>
                  {estado === 'enviando' ? 'Enviando…' : mudancas ? 'Confirmar e enviar' : 'Enviar pedido'} <Arrow />
                </button>
              ) : (
                <a className="botao botao--escuro botao--largo" href={contato} target="_blank" rel="noreferrer">
                  Falar com a loja <Arrow direction="upRight" />
                </a>
              )}
              <p className="resumo__depois">Depois de enviar, você abre o WhatsApp com a mensagem pronta para a loja.</p>
              <Link className="link resumo__continuar" href="/produtos">
                Continuar escolhendo <Arrow />
              </Link>
            </aside>
          )}

          {/* No celular, o total e o envio ficam sempre à mão. */}
          {!vazia && !pausada && !semPedidos && (
            <div className="barra-de-envio" aria-hidden="true">
              <div>
                <span>Total estimado</span>
                <strong>{totalTexto}</strong>
              </div>
              <button type="submit" className="botao botao--marca" disabled={!podeEnviar || estado === 'enviando'} tabIndex={-1}>
                {estado === 'enviando' ? 'Enviando…' : mudancas ? 'Confirmar' : 'Enviar pedido'}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
