import type { ReactNode } from 'react';
import { Moldura } from '../../src/moldura/Moldura';

/* O Bistrô é uma área com tema próprio (DESIGN-BRIEF §8): a mesma moldura, na família de cor dele. */
export default function LayoutDoBistro({ children }: { children: ReactNode }) {
  return <Moldura tema="bistro">{children}</Moldura>;
}
