import pageTitle from '@/utils/pageTitle';

// Settings
export const metadata = pageTitle('Statistiques');

export default function Page() {
  return (
    <div className={'fr-container'}>
      <div className="fr-grid-row">
        <div className="fr-col-12 fr-py-12v">
          <h1>Statistiques</h1>

          <div className="fr-grid-row fr-grid-row--gutters">
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/752eb314-8a49-4de1-ac6f-b39812fb451f"
              className="fr-col-12 fr-col-md-6"
              height="400"
            ></iframe>

            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/3a96df17-127c-4aef-be75-a3b7cdb53eb6"
              className="fr-col-12 fr-col-md-6"
              height="400"
            ></iframe>

            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/8da126c9-c3c3-41b7-9a95-93e5c35e26c2"
              className="fr-col-12 fr-col-md-6"
              height="600"
            ></iframe>

            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/c636a619-5a38-424c-b29f-13bf1757c698"
              className="fr-col-12 fr-col-md-6"
              height="600"
            ></iframe>

            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/120caec8-b03c-46f3-b3d0-6f7bd61286eb"
              className="fr-col-12 fr-col-md-6"
              height="600"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
