// SEO
import { Metadata } from 'next';

// Components
import RNBHeader from '@/components/RNBHeader';
import RNBFooter from '@/components/RNBFooter';
import { StartDsfrOnHydration } from '@codegouvfr/react-dsfr/next-app-router';
import { mainContentId } from '@/components/SkipLinks';

export const metadata: Metadata = {
  title: {
    default: 'Référentiel National des Bâtiments',
    template: '%s | RNB',
  },
  description:
    "Référencer l'intégralité des bâtiments du territoire français au sein de données et d'outils libres.",
};

export default function WithFooterLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RNBHeader />
      <StartDsfrOnHydration />
      <div id={mainContentId}>{children}</div>
      <RNBFooter />
    </>
  );
}
