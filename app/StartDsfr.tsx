'use client';

import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import { defaultColorScheme } from './defaultColorScheme';
import Link from 'next/link';

declare module '@codegouvfr/react-dsfr/spa' {
  interface RegisterLink {
    Link: typeof Link;
  }
}

startReactDsfr({ defaultColorScheme, Link });

export default function StartDsfr() {
  //Yes, leave null here.
  return null;
}
