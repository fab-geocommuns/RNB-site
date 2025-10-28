import NewHome from './NewHome';
import OldHome from './OldHome';
import pageTitle from '@/utils/pageTitle';

export const metadata = pageTitle('Accueil');
export default function Page() {
  if (process.env.NEXT_PUBLIC_NEW_HOME_ENABLED) {
    return <NewHome />;
  }

  return <OldHome />;
}
