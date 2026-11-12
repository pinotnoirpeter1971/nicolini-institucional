import type { ReactNode } from 'react';
import { Moldura } from '../../src/moldura/Moldura';

/* A landing da Rustichella não é redesenhada: recebe só a moldura nova, no tema dela. */
export default function LayoutDaRustichella({ children }: { children: ReactNode }) {
  return <Moldura tema="rustichella">{children}</Moldura>;
}
