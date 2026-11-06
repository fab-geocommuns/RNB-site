import { Metadata } from 'next';
import { StartDsfrOnHydration } from '@codegouvfr/react-dsfr/next-app-router';

import RNBHeader from '@/components/RNBHeader';
import RNBFooter from '@/components/RNBFooter';
import { PageNotFound } from '@/components/ErrorPage';
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
        <PageNotFound />
      </div>
      <RNBFooter />
    </>
  );
}
