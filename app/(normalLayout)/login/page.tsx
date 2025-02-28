// Session
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

// Styles
import styles from '@/styles/login.module.scss';
import LoginForm from '@/components/LoginForm';

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
            <div className="fr-col-12 fr-col-md-4 fr-col-offset-md-1">
              <div className="fr-mb-2v fr-pt-md-5v">
                <Badge small severity="info">
                  Nouveau
                </Badge>
              </div>

              <h6>Participer au RNB</h6>
              <p>
                Le Référentiel National des Bâtiments s&apos;ouvre aux
                contributions d&apos;une variété d&apos;acteurs publics, privés
                et citoyens.
              </p>
              <p>
                Si vous souhaitez participer à l&apos;enrichissement du RNB,
                vous pouvez demander un accès en remplissant le formulaire
                suivant.
              </p>
              <p>
                <a
                  href="https://tally.so/r/npJJjP"
                  target="_blank"
                  className="fr-btn fr-btn--secondary"
                >
                  Demander un accès
                </a>
              </p>
              <p></p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
