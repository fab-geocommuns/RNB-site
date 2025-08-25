// Other illustrations
import rapprochementIllu from '@/public/images/rapprochement.png';
import apiIllu from '@/public/images/api.png';

import Card from '@codegouvfr/react-dsfr/Card';
import Link from 'next/link';
import { fr } from '@codegouvfr/react-dsfr';

export default function ToolsAndServices() {
  return (
    <div className="section">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 ">
          <div className="section__titleblock">
            <h2 className="section__title">Outils et services</h2>
            <p className="section__subtitle">
              Consultez, intégrez et alimentez le référentiel
            </p>
          </div>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-6 ">
              <Card
                horizontal
                imageAlt=""
                imageUrl={rapprochementIllu.src}
                desc={
                  <span style={{ lineHeight: '1.8rem' }}>
                    <Link href="">→ Carte des bâtiments</Link>
                    <br />
                    <Link href="">→ Outil d&apos;édition</Link>
                    <br />
                    <Link href="">→ Définition et standard</Link>
                  </span>
                }
                title={
                  <span
                    style={{ color: 'var(--text-action-high-blue-france)' }}
                  >
                    Outils intéractifs
                  </span>
                }
              />
            </div>
            <div className="fr-col-12 fr-col-md-6 ">
              <Card
                horizontal
                imageAlt=""
                imageUrl={apiIllu.src}
                desc={
                  <span style={{ lineHeight: '1.8rem' }}>
                    <Link href="">→ Documentation de nos APIs</Link>
                    <br />
                    <Link href="">→ Guide d&apos;édition</Link>
                    <br />
                    <Link href="">→ Jeux de données</Link>
                  </span>
                }
                title={
                  <span
                    style={{ color: 'var(--text-action-high-blue-france)' }}
                  >
                    API et jeux de données
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
