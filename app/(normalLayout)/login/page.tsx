// Session
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

// Styles
import styles from '@/styles/login.module.scss';
import LoginForm from '@/components/authentication/LoginForm';
import CreateAccountForm from '@/components/authentication/CreateAccountForm';

// Comps
import { Badge } from '@codegouvfr/react-dsfr/Badge';

export default async function LoginPage() {
  // We don't want to allow users that are already logged in to access this page
  const session = await getServerSession();
  if (session) {
    redirect('/');
  }

  return (
    <>
      <main className="fr-pt-md-14v" role="main">
        <div className="fr-container fr-container--fluid fr-mb-md-14v">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-6">
              <div
                className={`fr-container ${styles.loginShell} fr-px-md-12v fr-py-10v fr-py-md-14v `}
              >
                <h2>Se connecter au RNB</h2>
                <div>
                  <LoginForm />
                </div>
              </div>
            </div>
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-6">
              <div className="fr-p-3w">
                <span className="fr-text--bold">
                  Je n'ai pas encore de compte
                </span>
                <h3>Créer un compte</h3>
                <CreateAccountForm />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
