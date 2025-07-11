// Session
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

// Components
import LoginForm from '@/components/authentication/LoginForm';
import CreateAccountForm from '@/components/authentication/CreateAccountForm';

// Styles
import styles from '@/styles/login.module.scss';

import summerStyles from '@/styles/summerGames.module.scss';

export default async function LoginPage() {
  // We don't want to allow users that are already logged in to access this page
  const session = await getServerSession();
  if (session) {
    redirect('/edition');
  }

  const enableCreateAccount = process.env.ENABLE_CREATE_ACCOUNT === 'true';

  return (
    <>
      <main className="fr-pt-md-14v" role="main">
        <div className="fr-container fr-container--fluid fr-mb-md-14v">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2 fr-mb-8v ">
              <div className={summerStyles.loginShell}>
                <h2 className={summerStyles.loginShellTitle}>
                  L&apos;expérience collaborative de l&apos;été
                </h2>
                <p>
                  Créez un compte pour participer à l&apos;expérimentation
                  collaborative organisée par le RNB. Une fois connecté, vous
                  pourrez directement éditer le référentiel et faire monter son
                  niveau de qualité.
                </p>
              </div>
            </div>

            <div className="fr-col-12 fr-col-md-6 fr-col-lg-6">
              <div
                className={`fr-container ${styles.shell} fr-px-md-12v fr-py-10v fr-py-md-14v `}
              >
                <h2>Se connecter au RNB</h2>
                <div>
                  <LoginForm />
                </div>
              </div>
            </div>
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-6">
              <div
                className={`fr-container ${styles.shell} fr-px-md-12v fr-py-10v fr-py-md-14v `}
              >
                {enableCreateAccount && (
                  <>
                    <h3>Créer un compte RNB</h3>
                    <CreateAccountForm />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
