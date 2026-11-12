import type { ReactNode } from 'react';
import { Moldura } from '../../src/moldura/Moldura';

/* A moldura do empório: a home, a loja física, os produtos, o blog, os
 * eventos, a sacola e o recibo. O Bistrô e a Rustichella têm layout próprio,
 * com a mesma moldura e o tema deles. */
export default function LayoutDaCasa({ children }: { children: ReactNode }) {
  return <Moldura>{children}</Moldura>;
}
