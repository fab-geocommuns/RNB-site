import {
  DsfrHeadBase,
  type DsfrHeadProps,
  createGetHtmlAttributes,
} from '@codegouvfr/react-dsfr/next-app-router/server-only-index';
import { defaultColorScheme } from './defaultColorScheme';
import Link from 'next/link';
import { DsfrProviderBase } from '@codegouvfr/react-dsfr/next-app-router/DsfrProvider';
import { DsfrProviderProps } from '@codegouvfr/react-dsfr/next-app-router/DsfrProvider';

export const { getHtmlAttributes } = createGetHtmlAttributes({
  defaultColorScheme,
});

export function DsfrHead(props: DsfrHeadProps) {
  return <DsfrHeadBase Link={Link} {...props} />;
}

export function DsfrProvider(props: DsfrProviderProps) {
  return (
    <DsfrProviderBase
      Link={Link}
      defaultColorScheme={defaultColorScheme}
      {...props}
    />
  );
}
