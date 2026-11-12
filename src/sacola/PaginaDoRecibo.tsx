'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { orderTokenFromHash, type PublicOrderReceiptData } from '../engine/sdk-0.7.0/index.js';
import { lerRecibo } from '../engine/navegador';
import { dataEHora, dataPorExtenso, dinheiro, gramas } from '../engine/formato';
import { casa } from '../data/casa';
import { laboratorio } from '../site';
import { Alerta, Arrow, WhatsappGlyph } from '../components/Icons';
import { esquecerPedidos, pedidosDoAparelho, type PedidoDoAparelho } from './aparelho';

/*
 * O recibo (SPEC-SITE §7.1). Página estática: o token vem no fragmento
 * (/pedido#<token>) e vai ao Engine no corpo da chamada; nunca chega ao
 * servidor do site. A ação principal é "Enviar pelo WhatsApp", um link comum
 * que funciona de novo a qualquer momento. Logo depois do envio, o site também
 * tenta levar a aba ao WhatsApp; se o navegador barrar, o botão continua aqui.
 */

const SITUACAO: Record<PublicOrderReceiptData['status'], { rotulo: string; titulo: [string, string] }> = {
  new: { rotulo: 'Novo: a loja ainda não recebeu', titulo: ['Falta só enviar', 'a mensagem.'] },
  in_progress: { rotulo: 'Em atendimento pela loja', titulo: ['A loja está', 'cuidando do pedido.'] },
  done: { rotulo: 'Concluído', titulo: ['Pedido', 'concluído.'] },
  cancelled: { rotulo: 'Cancelado', titulo: ['Pedido', 'cancelado.'] },
};

type Estado = { tipo: 'carregando' } | { tipo: 'recibo'; recibo: PublicOrderReceiptData } | { tipo: 'nao-encontrado' } | { tipo: 'erro' };

function PedidosDoAparelho({ atual }: { atual?: string }) {
  const [lista, setLista] = useState<PedidoDoAparelho[]>([]);
  useEffect(() => setLista(pedidosDoAparelho().filter((p) => p.token !== atual)), [atual]);
  if (!lista.length) return null;
  return (
    <section className="do-aparelho" aria-labelledby="do-aparelho">
      <p className="eyebrow" id="do-aparelho">
        Pedidos feitos neste aparelho
      </p>
      <ul>
        {lista.map((p) => (
          <li key={p.token}>
            <a href={`/pedido#${p.token}`}>
              Pedido nº {p.numero}
              <span>{dataPorExtenso(p.data)}</span>
              <Arrow />
            </a>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="link"
        onClick={() => {
          esquecerPedidos();
          setLista([]);
        }}
      >
        Esquecer estes pedidos neste aparelho
      </button>
      <p className="do-aparelho__nota">A lista fica só neste navegador; não é uma conta.</p>
    </section>
  );
}

export function PaginaDoRecibo() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [tentativa, setTentativa] = useState(0);
  const [tentouAbrir, setTentouAbrir] = useState(false);

  useEffect(() => {
    const ler = () => setToken(orderTokenFromHash(window.location.hash));
    ler();
    window.addEventListener('hashchange', ler);
    return () => window.removeEventListener('hashchange', ler);
  }, []);

  useEffect(() => {
    if (token === undefined) return undefined;
    if (token === null) {
      setEstado({ tipo: 'nao-encontrado' });
      return undefined;
    }
    let vivo = true;
    setEstado({ tipo: 'carregando' });
    lerRecibo(token)
      .then((r) => vivo && setEstado(r ? { tipo: 'recibo', recibo: r } : { tipo: 'nao-encontrado' }))
      .catch(() => vivo && setEstado({ tipo: 'erro' }));
    return () => {
      vivo = false;
    };
  }, [token, tentativa]);

  /* Recém-enviado: tenta levar a mesma aba ao WhatsApp (pode ser barrado no
   * iPhone e no Instagram; o botão nunca some). No laboratório não tenta, para
   * o teste não sair do site. */
  const recibo = estado.tipo === 'recibo' ? estado.recibo : null;
  useEffect(() => {
    if (!recibo?.whatsappUrl || !token) return;
    let recem: string | null = null;
    try {
      recem = sessionStorage.getItem('nicolini:recem-enviado');
      if (recem === token) sessionStorage.removeItem('nicolini:recem-enviado');
    } catch {
      /* sem armazenamento */
    }
    if (recem !== token) return;
    setTentouAbrir(true);
    if (!laboratorio) window.location.assign(recibo.whatsappUrl);
  }, [recibo, token]);

  const tentarDeNovo = useCallback(() => setTentativa((t) => t + 1), []);

  if (estado.tipo === 'carregando') {
    return (
      <section className="recibo wrap" aria-busy="true">
        <p className="eyebrow">Pedido</p>
        <p className="recibo__carregando">Abrindo o pedido…</p>
      </section>
    );
  }

  if (estado.tipo === 'nao-encontrado' || estado.tipo === 'erro') {
    const erro = estado.tipo === 'erro';
    return (
      <section className="recibo wrap">
        <div className="vazio vazio--esquerda">
          <p className="eyebrow">{erro ? 'Pedido' : 'Pedido não encontrado'}</p>
          <h1>
            {erro ? 'Não deu para abrir' : 'Este pedido não foi'}
            <br />
            <em>{erro ? 'o pedido agora.' : 'encontrado.'}</em>
          </h1>
          <p>
            {erro
              ? 'A conexão com a loja falhou. O pedido não se perdeu: tente de novo em instantes.'
              : 'O link pode estar incompleto ou ter passado do prazo de 60 dias. Se você fez um pedido, a loja tem o número dele: fale com ela pelo WhatsApp.'}
          </p>
          <div className="acoes">
            {erro ? (
              <button type="button" className="botao botao--escuro" onClick={tentarDeNovo}>
                Tentar de novo <Arrow />
              </button>
            ) : (
              <a className="botao botao--escuro" href={`https://wa.me/${casa.whatsapp.link}`} target="_blank" rel="noreferrer">
                Falar com a loja <Arrow direction="upRight" />
              </a>
            )}
            <Link className="link" href="/produtos">
              Ver os produtos <Arrow />
            </Link>
          </div>
        </div>
        <PedidosDoAparelho />
      </section>
    );
  }

  const r = estado.recibo;
  const sit = SITUACAO[r.status];
  const novo = r.status === 'new';
  return (
    <section className={`recibo wrap ${novo ? 'recibo--novo' : ''}`}>
      <div className="recibo__grade">
        <div className="recibo__principal">
          <p className="eyebrow">
            Pedido nº {r.number} · {dataEHora(r.createdAt)}
          </p>
          <h1>
            {sit.titulo[0]}
            <br />
            <em>{sit.titulo[1]}</em>
          </h1>
          <p className={`recibo__situacao recibo__situacao--${r.status}`}>
            <span aria-hidden="true" /> Situação: {sit.rotulo}
          </p>

          {novo && (
            <div className="aviso aviso--marca" role="note">
              <Alerta />
              <p>
                <b>O pedido só chega à loja depois que você enviar a mensagem.</b> Toque no botão abaixo: o WhatsApp abre com o número do pedido e o link
                deste recibo. A loja confirma disponibilidade, peso e valor final por lá.
              </p>
            </div>
          )}

          {r.whatsappUrl && (
            <a className="botao botao--whatsapp botao--largo recibo__whatsapp" href={r.whatsappUrl}>
              <WhatsappGlyph /> Enviar pelo WhatsApp
            </a>
          )}
          {tentouAbrir && laboratorio && (
            <p className="recibo__nota">Laboratório: aqui o site tentaria abrir o WhatsApp sozinho.</p>
          )}
          {!novo && r.whatsappUrl && <p className="recibo__nota">Pode enviar de novo a qualquer momento: é a mesma mensagem.</p>}
        </div>

        <div className="recibo__itens">
          <p className="eyebrow">Itens</p>
          <ul>
            {r.items.map((i, n) => (
              <li key={`${i.productId ?? i.name}-${n}`}>
                <div>
                  {i.brand && <span className="linha__marca">{i.brand}</span>}
                  <span className="recibo__nome">{i.name}</span>
                  <span className="recibo__qtd">
                    {i.saleMode === 'weight' ? `${gramas(i.quantity)} · ${dinheiro(i.unitPriceCents, r.currency)} o quilo` : `${i.quantity} × ${dinheiro(i.unitPriceCents, r.currency)}${i.sizeLabel ? ` · ${i.sizeLabel}` : ''}`}
                  </span>
                </div>
                <b>
                  {i.saleMode === 'weight' && '≈ '}
                  {dinheiro(i.lineTotalCents, r.currency)}
                </b>
              </li>
            ))}
          </ul>
          <div className="total total--grande">
            <span>Total estimado</span>
            <strong>{dinheiro(r.estimatedTotalCents, r.currency)}</strong>
          </div>
          <p className="total__nota">Valores estimados. A loja confirma disponibilidade, peso e valor final pelo WhatsApp.</p>
          {(r.customerName || r.note) && (
            <dl className="recibo__dados">
              {r.customerName && (
                <div>
                  <dt>Nome</dt>
                  <dd>{r.customerName}</dd>
                </div>
              )}
              {r.note && (
                <div>
                  <dt>Observação</dt>
                  <dd>{r.note}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>

      <PedidosDoAparelho atual={token ?? undefined} />

      <p className="recibo__equipe">
        <a href={r.panelUrl} rel="nofollow">
          Equipe: abrir no painel
        </a>
      </p>
    </section>
  );
}
