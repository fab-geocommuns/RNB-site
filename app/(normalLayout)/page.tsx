import NewHome from './NewHome';
import OldHome from './OldHome';

export default function Page() {
  if (process.env.NEW_HOME_ENABLED) {
    return <NewHome />;
  }

  return <OldHome />;
}
