import Alert from '@codegouvfr/react-dsfr/Alert';
import UnsubscribeForm from '@/components/notifications/UnsubscribeForm';
import pageTitle from '@/utils/pageTitle';

export const metadata = pageTitle('Désinscription des notifications', {
  robots: { index: false },
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="fr-pt-md-14v" role="main">
      <div className="fr-container fr-mb-md-14v">
        <div className="fr-grid-row">
          <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-3">
            <h1>Désinscription des notifications</h1>
            {typeof token === 'string' && token !== '' ? (
              <>
                <p>
                  Vous ne recevrez plus d&apos;email lorsqu&apos;un de vos
                  signalements est traité, refusé ou commenté.
                </p>
                <UnsubscribeForm token={token} />
              </>
            ) : (
              <Alert
                severity="error"
                description="Ce lien de désinscription est incomplet."
                closable={false}
                small={true}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
