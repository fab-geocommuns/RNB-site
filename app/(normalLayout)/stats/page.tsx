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
          <div className="fr-pb-4v">
            Le RNB référence l&apos;ensemble des bâtiments situés en France et
            leur attribue un identifiant unique appelé ID-RNB. Les bâtiments du
            RNB peuvent être liés à une ou plusieurs adresses de la{' '}
            <a href="https://adresse.data.gouv.fr/">BAN</a>.
          </div>
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
          <div className="fr-pb-4v">
            Les identifiants du RNB ont vocation à être diffusés aussi largement
            que possible afin de faciliter l&apos;échange d&apos;information
            entre bases bâtimentaires. Notre but : que la manière la plus
            naturelle de désigner un bâtiment soit son ID-RNB. Nous diffusons
            ces identifiants par deux canaux principaux : notre{' '}
            <a href="https://rnb-fr.gitbook.io/documentation/api-et-outils/liste-des-api-et-outils-du-rnb">
              API
            </a>{' '}
            et nos exports{' '}
            <a href="https://www.data.gouv.fr/datasets/referentiel-national-des-batiments">
              data.gouv.fr
            </a>
            .
          </div>
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
            </div>
          </div>
          <h2 className="fr-pt-10v">Mise à jour du référentiel</h2>
          <div className="fr-pb-4v">
            Le RNB est un référentiel vivant, mis quotidiennement à jour par une
            communauté de contributeurs et sur l&apos;ensemble du territoire.
            Les mises à jour peuvent porter sur la création de bâtiments, sur
            l&apos;enrichissement du lien bâtiment-adresse ou sur d&apos;autres
            types d&apos;actions.
          </div>
          <div className="fr-grid-row fr-grid-row--gutters">
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/8da126c9-c3c3-41b7-9a95-93e5c35e26c2"
              className="fr-col-12 fr-col-md-6"
              height="600"
            ></iframe>
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/f34ddc0c-c07f-48ed-900a-41a6149106c6"
              className="fr-col-12 fr-col-md-6"
              height="600"
            ></iframe>
            <iframe
              src="https://rnb-api.beta.gouv.fr/metabase/public/question/6dc7902a-f054-440e-94f7-17bc4525b4fc"
              className="fr-col-12 fr-col-md-12"
              height="600"
            ></iframe>
          </div>
          <h2 className="fr-pt-10v">Intégration</h2>
          <div className="fr-pb-4v">
            Les identifiants RNB se trouvent aujourd&apos;hui dans de nombreuses
            bases, en open-data ou non. Des outils intègrent également le RNB
            pour permettre à leurs utilisateurs de travailler sans ambiguité sur
            des données bâtimentaires.
          </div>
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
          <div className="fr-pb-4v">
            Parmi les bases intégrant les ID-RNB, la base des DPE est
            incontournable dans le domaine du bâti. Remplie quotidiennement par
            des diagnostiqueurs, la{' '}
            <a href="https://data.ademe.fr/datasets?topics=BR8GjsXga">base</a>{' '}
            est publiée en open-data par l&apos;ADEME et intègre d&apos;ores et
            déjà les ID-RNB.
          </div>
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
