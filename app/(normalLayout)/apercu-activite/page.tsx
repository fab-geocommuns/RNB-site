import pageTitle from '@/utils/pageTitle';

import PreviewPage from './PreviewPage';

export const metadata = pageTitle('Aperçu de l’activité', {
  robots: { index: false },
});

export default function Page() {
  return <PreviewPage variant="simple" />;
}
