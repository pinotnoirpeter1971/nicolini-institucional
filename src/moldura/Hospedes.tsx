'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ABRIR_PAINEL } from '../sacola/armazem';

/*
 * O painel da sacola só é baixado quando alguém o abre (o ícone do header ou
 * "Adicionar"): o JavaScript da sacola não pesa nas páginas além do contador
 * (SPEC-SITE §10).
 */
const PainelDaSacola = dynamic(() => import('../sacola/PainelDaSacola'), { ssr: false });

export function HospedeDaSacola() {
  const [estado, setEstado] = useState<'nunca' | 'aberto' | 'fechado'>('nunca');
  const fechar = useCallback(() => setEstado((e) => (e === 'aberto' ? 'fechado' : e)), []);
  useEffect(() => {
    const abrir = () => setEstado('aberto');
    window.addEventListener(ABRIR_PAINEL, abrir);
    return () => window.removeEventListener(ABRIR_PAINEL, abrir);
  }, []);
  if (estado === 'nunca') return null;
  return <PainelDaSacola aberto={estado === 'aberto'} fechar={fechar} />;
}

/* Só no `next dev` com dados simulados: no build de produção a condição é `false` e o import some. */
const PainelDoLaboratorio =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SITE_DADOS !== 'engine' ? dynamic(() => import('../laboratorio/PainelDoLaboratorio'), { ssr: false }) : null;

export function HospedeDoLaboratorio() {
  return PainelDoLaboratorio ? <PainelDoLaboratorio /> : null;
}
