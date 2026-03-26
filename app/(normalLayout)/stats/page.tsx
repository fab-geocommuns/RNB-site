import pageTitle from '@/utils/pageTitle';

// Settings
export const metadata = pageTitle('Statistiques');

export default function Page() {
  return (
    <div className={'fr-container'}>
      <div className="fr-grid-row">
        <div className="fr-col-12 fr-py-12v">
          <h1>Statistiques</h1>
          <h2>Le référentiel</h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/752eb314-8a49-4de1-ac6f-b39812fb451f"
              className="fr-col-12 fr-col-md-6"
              height="300"
            ></iframe>
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/17117ecf-f5da-4590-9c31-89149a98f25e"
              className="fr-col-12 fr-col-md-6"
              height="300"
            ></iframe>
          </div>
          <h2 className="fr-pt-10v">Diffusion</h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/0e6f0fdc-5641-4a8b-9533-86836a58c4a9"
              className="fr-col-12 fr-col-md-6"
              height="600"
            ></iframe>
            <div
              className="fr-col-12 fr-col-md-6"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <iframe
                src="https://rnb-api.beta.gouv.fr/metabase/public/question/20d2fed4-aa37-4325-be5a-7543d8abae78"
                width="100%"
                height="280"
              ></iframe>
              <iframe
                src="https://rnb-api.beta.gouv.fr/metabase/public/question/ca332a09-78d1-492c-bba3-4971cf5ba5b8"
                width="100%"
                height="280"
              ></iframe>
            </div>
          </div>
          <h2 className="fr-pt-10v">Mise à jour du référentiel</h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/8da126c9-c3c3-41b7-9a95-93e5c35e26c2"
              className="fr-col-12 fr-col-md-6"
              height="600"
            ></iframe>
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/120caec8-b03c-46f3-b3d0-6f7bd61286eb"
              className="fr-col-12 fr-col-md-6"
              height="600"
            ></iframe>
          </div>
          <h2 className="fr-pt-10v">Intégration</h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/468dfc08-c5d8-4912-ad52-4c759ba1a748"
              className="fr-col-12 fr-col-md-6"
              height="600"
            ></iframe>
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/a6c001c4-f0bb-499c-88c4-1fa162568907"
              className="fr-col-12 fr-col-md-6"
              height="600"
            ></iframe>
          </div>
          <h2 className="fr-pt-10v">Cas d&apos;usage : les DPE</h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/6c9de2f4-5a5e-41f1-a42a-e9ae1dac2adf"
              className="fr-col-12 fr-col-md-6"
              height="300"
            ></iframe>
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/5e5d1ecf-01c9-4a91-8779-76c0b5e34cdc"
              className="fr-col-12 fr-col-md-6"
              height="300"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
