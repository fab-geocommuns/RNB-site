'use client';
import { SkipLinks as DsfrSkipLinks } from '@codegouvfr/react-dsfr/SkipLinks';
import { usePathname } from 'next/navigation';

export const headerId = 'header-navigation';
export const mainContentId = 'main-content';
export const homeSearchId = 'home-search';
export const footerId = 'footer';

export default function SkipLinks({
  withNavigation = true,
}: {
  withNavigation?: boolean;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const links = [
    {
      anchor: `#${mainContentId}`,
      label: 'Contenu principal',
    },
  ];
  if (withNavigation) {
    links.push({
      anchor: `#${headerId}-main-navigation`,
      label: 'Menu principal',
    });
  }
  links.push({
    anchor: `#${footerId}`,
    label: 'Pied de page',
  });

  if (isHome) {
    links.push({
      anchor: `#${homeSearchId}`,
      label: 'Rechercher un bâtiment',
    });
  }
  return (
    <DsfrSkipLinks
      classes={{
        root: 'fr-mt-9v',
      }}
      links={links}
    />
  );
}
