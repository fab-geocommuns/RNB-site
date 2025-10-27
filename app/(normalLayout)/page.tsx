import NewHome from './NewHome';
import pageTitle from '@/utils/pageTitle';

export const metadata = pageTitle('Accueil');
export default function Page() {
  return <NewHome />;
}
