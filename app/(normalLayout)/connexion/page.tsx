import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import pageTitle from '@/utils/pageTitle';
import styles from '@/styles/login.module.scss';
import AuthBlock from '@/components/authentication/AuthBlock';

export const metadata = pageTitle('Se connecter');

export default async function ConnexionPage({
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
      redirect('/connexion');
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
              <AuthBlock mode="login" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
