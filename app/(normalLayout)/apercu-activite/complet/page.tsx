import pageTitle from '@/utils/pageTitle';

import PreviewPage from '../PreviewPage';

export const metadata = pageTitle('Aperçu de l’activité (complet)', {
  robots: { index: false },
});

export default function Page() {
  return <PreviewPage variant="complet" />;
}
