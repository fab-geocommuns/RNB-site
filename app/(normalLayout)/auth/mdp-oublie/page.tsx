// Session
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

// Components
import { Alert } from '@codegouvfr/react-dsfr/Alert';

export default async function ForgotPasswordPage({ searchParams }) {
  // Custom server action to handle the form submission
  async function requestNewPassword(data: FormData) {
    'use server';

    const email = data.get('email') as string;

    // Send the reques to the API
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/auth/reset_password/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      },
    );

    if (res.status === 204) {
      redirect('/auth/mdp-oublie?success=true');
    } else {
      redirect('/auth/mdp-oublie?success=false');
    }
  }

  const defaultEmail = searchParams.email;
  const success = searchParams.success;

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
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-6 fr-col-offset-md-3">
              <div className="fr-px-md-12v ">
                <h2>Mot de passe oublié</h2>

                {success == 'true' && (
                  <div className="fr-mb-3w">
                    <Alert
                      title="Email envoyé"
                      description="Un email de réinitialisation de mot de passe a été envoyé à votre adresse."
                      severity="success"
                    />
                  </div>
                )}
                {success == 'false' && (
                  <div className="fr-mb-3w">
                    <Alert
                      title="Erreur"
                      description="Une erreur est survenue lors de l'envoi de l'email de réinitialisation. L'équipe du RNB est prévenue. Veuillez réessayer plus tard."
                      severity="error"
                    />
                  </div>
                )}

                <p>
                  Indiquez l'email de votre compte RNB pour que nous puissions
                  vous envoyer des instructions de réinitilisation de votre mot
                  de passe.
                </p>
                <form action={requestNewPassword}>
                  <div className="fr-input-group fr-mb-6v fr-mt-10v">
                    <label className="fr-label" htmlFor="email">
                      Votre adresse email
                    </label>
                    <input
                      className="fr-input"
                      type="email"
                      name="email"
                      id="email"
                      defaultValue={defaultEmail}
                      required
                    />
                  </div>

                  <button className="fr-btn" type="submit">
                    Demander un nouveau mot de passe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
