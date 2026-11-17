import { auth } from '@/app/api/auth/[...nextauth]/auth';
import { Notice } from '@codegouvfr/react-dsfr/Notice';
import { redirect } from 'next/navigation';
import SecuritySettings from './SecuritySettings';
import pageTitle from '@/utils/pageTitle';
import { createRnbApi } from '@/utils/rnbApi';

export const metadata = pageTitle('Mon compte');

export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect('/connexion?redirect=/mon-compte/securite');
  }

  if (session.authProvider === 'proconnect') {
    return (
      <>
        <h1>Sécurité</h1>
        <Notice
          title="La double authentification de votre compte est gérée par ProConnect."
          isClosable={false}
        />
      </>
    );
  }

  const { configured } = await createRnbApi({
    token: session.accessToken,
  }).get<{ configured: unknown }>('/auth/mfa/status/');
  if (typeof configured !== 'boolean') {
    throw new Error('GET auth/mfa/status returned no configured flag');
  }
  if (!session.username) {
    throw new Error('Password session without a username');
  }

  return (
    <>
      <h1>Sécurité</h1>
      <SecuritySettings
        username={session.username}
        mfaConfigured={configured}
      />
    </>
  );
}
