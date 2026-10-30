import { Metadata } from 'next';
import { StartDsfrOnHydration } from '@codegouvfr/react-dsfr/next-app-router';

import RNBHeader from '@/components/RNBHeader';
import RNBFooter from '@/components/RNBFooter';
import ErrorPage from '@/components/ErrorPage';
import { mainContentId } from '@/components/SkipLinks';

export const metadata: Metadata = {
  title: 'Page non trouvée | RNB',
};

// Rendered in the root layout only, outside any route group: header and footer are added here
export default function NotFound() {
  return (
    <>
      <RNBHeader />
      <StartDsfrOnHydration />
      <div id={mainContentId}>
        <ErrorPage
          title="Page non trouvée"
          lead="La page que vous cherchez est introuvable. Excusez-nous pour la gêne occasionnée."
          details="Si vous avez tapé l'adresse web dans le navigateur, vérifiez qu'elle est correcte. La page n'est peut-être plus disponible."
          buttons={[{ children: "Page d'accueil", linkProps: { href: '/' } }]}
        />
      </div>
      <RNBFooter />
    </>
  );
}
