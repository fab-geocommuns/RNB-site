import AdsAccessRequestForm from '@/components/ads/AdsAccessRequestForm';
import pageTitle from '@/utils/pageTitle';

export const metadata = pageTitle('Demander un accès ADS');

export default function Page() {
  return (
    <div className="fr-container">
      <div className="fr-grid-row">
        <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1 fr-pt-12v fr-pb-12v">
          <h1>Demander un accès ADS</h1>
          <p>
            Ce service est gratuit et réservé aux collectivités. Votre demande
            est étudiée au cas par cas.
          </p>
          <AdsAccessRequestForm />
        </div>
      </div>
    </div>
  );
}
