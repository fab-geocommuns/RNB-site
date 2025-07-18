// Session

import { auth } from '@/app/api/auth/[...nextauth]/auth';

// Redirect
import { redirect } from 'next/navigation';

// Comps
import CopyButton from '@/components/CopyButton';
import { Notice } from '@codegouvfr/react-dsfr/Notice';
import Link from 'next/link';

export default async function Page() {
  // We don't want to allow anonymous visitors to access this page
  const session = await auth();
  if (!session) {
    redirect('/login?redirect=/mon-compte/cles-api');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/auth/users/me/tokens`,
    {
      method: 'GET',
      headers: {
        Authorization: 'Token ' + (session as any).accessToken,
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();

  return (
    <>
      <h1>Mes clés d&apos;API</h1>
      <p className="fr-mb-12v">
        Les clés d&apos;API sont nécessaires pour modifier le RNB via l&apos;API
        d&apos;édition.
        <br />
        <a
          href="https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb"
          target="_blank"
        >
          Consulter la documentation de l&apos;API d&apos;édition
        </a>
      </p>

      <div className="block block--yellow fr-mb-8v">
        <h2 className="blockTitle">Environnement bac à sable</h2>
        <p className="blockSubtitle">
          <a
            href="https://rnb-fr.gitbook.io/documentation/api-et-outils/bac-a-sable"
            target="_blank"
          >
            L&apos;environnement bac à sable
          </a>{' '}
          vous permet d&apos;expérimenter sans crainte d&apos;abîmer le
          RNB.{' '}
        </p>

        <div className="fr-my-6v">
          {data.sandbox_token === null ? (
            <Notice
              description="la création de votre clé de bac à sable a échoué, l'équipe RNB a été prévenue du problème et fait son possible pour le résoudre."
              severity="warning"
              iconDisplayed={true}
              isClosable={false}
              title="Erreur :"
            />
          ) : (
            <pre>{data.sandbox_token}</pre>
          )}
        </div>

        {data.sandbox_token != null ? (
          <div className="blockLinkShell">
            <CopyButton
              valueToCopy={data.sandbox_token}
              label="Copier la clé bac à sable"
              okMsg="Clé copiée"
            />
          </div>
        ) : (
          ''
        )}
      </div>

      <div className="block block--blue">
        <h2 className="blockTitle">
          <i className="fr-icon ri-error-warning-line"></i> Environnement de
          production
        </h2>
        <div className="blockSubtitle">
          <p>
            Écrire dans l&apos;environnement de production modifie directement
            le RNB et met vos contributions à disposition de tous.
          </p>
          <p>
            <b>
              Veillez à consulter la{' '}
              <Link href="/definition">définition du bâtiment</Link> et le{' '}
              <a href="https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb">
                guide d&apos;édition
              </a>{' '}
              avant d&apos;éditer le RNB.
            </b>
          </p>
        </div>

        <div className="fr-my-6v">
          <pre>{data.production_token}</pre>
        </div>
        <div className="blockLinkShell">
          <CopyButton
            valueToCopy={data.production_token}
            label="Copier la clé de production"
            okMsg="Clé copiée"
          />
        </div>
      </div>
    </>
  );
}
