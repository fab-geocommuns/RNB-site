'use client';

// Styles
import styles from '@/styles/stats.module.scss';

// Settings
import { useState } from 'react';
import { useEffect } from 'react';

export default function Page() {
  // initialize the stats
  const [stats, setStats] = useState({
    building_counts: null,
    api_calls_since_2024_count: null,
    contributions_count: null,
    data_gouv_publication_count: null,
  });
  const [loading, setLoading] = useState(true);

  const endpointUrl = process.env.NEXT_PUBLIC_API_BASE + '/stats';

  useEffect(() => {
    // make a request to the API to get the stats when the page is loaded
    fetch(endpointUrl)
      .then((response) => response.json())
      .then((stats) => {
        setStats(stats);
        setLoading(false);
      });
  }, []);

  // @ts-ignore
  const stat_display = function (key) {
    let card;
    if (loading) {
      card = '...';
    } else {
      // @ts-ignore
      if (stats[key] == null) {
        card = '?';
      } else {
        // @ts-ignore
        card = stats[key].toLocaleString('fr-FR');
      }
    }
    return card;
  };

  // @ts-ignore
  let more_than_one_dataset = stats.data_gouv_publication_count > 1;

  return (
    <div className={'fr-container'}>
      <div className="fr-grid-row">
        <div className="fr-col-12 fr-py-12v">
          <h1>Statistiques</h1>

          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-6">
              <div className={styles['stat-card'] + ' fr-p-6v'}>
                <h2>{stat_display('api_calls_since_2024_count')}</h2>
                <div>Appels à l&apos;API depuis janvier 2024</div>
                <div className="fr-pt-3w">
                  <a
                    href="https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments"
                    className="fr-link"
                  >
                    Voir la doc
                  </a>
                </div>
              </div>
            </div>

            <div className="fr-col-12 fr-col-md-6">
              <div className={styles['stat-card'] + ' fr-p-6v'}>
                <h2>{stat_display('building_counts')}</h2>
                <div>Bâtiments référencés</div>
                <div className="fr-pt-3w">
                  <a href="/carte" className="fr-link">
                    Voir la carte
                  </a>
                </div>
              </div>
            </div>

            <div className="fr-col-12 fr-col-md-6">
              <div className={styles['stat-card'] + ' fr-p-6v'}>
                <h2>{stat_display('data_gouv_publication_count')}</h2>
                <div>
                  Jeu{more_than_one_dataset ? 'x' : ''} de données utilisant les
                  identifiants RNB
                </div>
                <div className="fr-pt-3w">
                  <a href="/outils-services/rapprochement" className="fr-link">
                    Les parcourir
                  </a>
                </div>
              </div>
            </div>

            <div className="fr-col-12 fr-col-md-6">
              <div className={styles['stat-card'] + ' fr-p-6v'}>
                <h2>{stat_display('contributions_count')}</h2>
                <div>Signalements d&apos;erreur reçus</div>
                <div className="fr-pt-3w">
                  <a href="/carte" className="fr-link">
                    Faire un signalement
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
