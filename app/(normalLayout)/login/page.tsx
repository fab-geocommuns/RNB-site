// Session
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

// Styles
import styles from '@/styles/login.module.scss';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect('/');
  }

  return (
    <>
      <main className="fr-pt-md-14v" role="main">
        <div className="fr-container fr-container--fluid fr-mb-md-14v">
          <div className="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
              <div
                className={`fr-container ${styles.loginShell} fr-px-md-0 fr-py-10v fr-py-md-14v `}
              >
                <div className="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                  <div className="fr-col-12 fr-col-md-9 fr-col-lg-8">
                    <h1>Connexion au RNB</h1>
                    <div>
                      <LoginForm />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
