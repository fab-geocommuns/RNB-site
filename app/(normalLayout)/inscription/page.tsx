import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import pageTitle from '@/utils/pageTitle';
import styles from '@/styles/login.module.scss';
import AuthBlock from '@/components/authentication/AuthBlock';

export const metadata = pageTitle("S'inscrire");

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession();
  if (session) {
    redirect('/edition');
  }

  const redirectUrl = (await searchParams).redirect as string | undefined;
  const headersList = await headers();

  if (redirectUrl) {
    const requestHost = headersList.get('host');
    const requestProtocol = headersList.get('x-forwarded-proto');
    const requestUrlRoot = requestProtocol
      ? `${requestProtocol}://${requestHost}`
      : `https://${requestHost}`;

    try {
      const redirectUrlObj = new URL(redirectUrl, requestUrlRoot);
      const requestUrlObj = new URL(requestUrlRoot);

      if (redirectUrlObj.origin !== requestUrlObj.origin) {
        throw new Error('Mauvaise origine');
      }
    } catch {
      redirect('/inscription');
    }
  }

  return (
    <main className="fr-pt-md-14v" role="main">
      <div className="fr-container fr-container--fluid fr-mb-md-14v">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-6">
            <div
              className={`fr-container ${styles.shell} fr-px-md-12v fr-py-10v fr-py-md-14v`}
            >
              <AuthBlock mode="signup" />
            </div>
          </div>
          <div className="fr-col-12 fr-col-md-6">
            <div className="fr-container fr-px-md-12v fr-py-10v fr-py-md-14v">
              <h3>Le RNB est participatif</h3>
              <p>
                <span className="stab stab--yellow">
                  <b>
                    Créer un compte vous permet de participer à l'amélioration
                    du RNB.
                  </b>
                </span>
              </p>
              <p>
                Vous pourrez directement éditer le référentiel, ajouter un
                bâtiment, corriger une adresse, désactiver les erreurs, ...
              </p>
              <p>
                Services de l'État, collectivités, citoyens, entreprises ou
                associations sont invités à apporter leur pierre au RNB.
              </p>
              <p>
                Le RNB est entièrement transparent. Chaque contribution est
                historisée, tracée et mise à disposition de tous.
              </p>
              <h6 className="fr-mt-12v">Consulter les données sans compte</h6>
              <p>
                Accéder aux données du RNB est gratuit et ne nécessite pas de
                compte.
              </p>
              <ul>
                <li>
                  <a href="/carte">Parcourir la carte des bâtiments</a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href="https://www.data.gouv.fr/datasets/referentiel-national-des-batiments"
                  >
                    Télécharger le RNB
                  </a>
                </li>
                <li>
                  <a href="/doc">Accéder à la documentation technique</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
