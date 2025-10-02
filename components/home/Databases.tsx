import { DiffusionDatabase } from '../diffusionDatabase.type';
import styles from '@/styles/home.module.scss';
import { fr } from '@codegouvfr/react-dsfr';

type Props = {
  databases: DiffusionDatabase[];
};

function FeaturedDatabases({ dbs }: { dbs: DiffusionDatabase[] }) {
  return (
    <div className={styles.featuredDatabases}>
      {dbs.map((db) => (
        <div
          className={styles.featuredDatabases__item}
          title={db.featured_summary || ''}
          key={db.id}
        >
          <img
            src={db.image_url || ''}
            alt={db.name}
            className={styles.featuredDatabases__item__logo}
          />
        </div>
      ))}
    </div>
  );
}

export default function Databases({ databases }: Props) {
  const databaseCount = databases.length;
  const featuredDatabases = databases.filter((db) => db.is_featured);

  return (
    <div className="section">
      <div className={styles.dbsShell}>
        <div className="section__titleblock">
          <h2 className="section__title">
            Enrichissez vos données bâtimentaires
          </h2>
          <p className="section__subtitle">
            Croisez facilement les données de {databaseCount} bases intégrant
            les ID-RNBs
          </p>
        </div>
        <div className={styles.searchContainer}>
          <FeaturedDatabases dbs={featuredDatabases} />
          <div className={styles.allDbsLink}>
            <a
              href="/outils-services/rapprochement"
              className={fr.cx('fr-btn', 'fr-btn--tertiary')}
            >
              Voir l&apos;ensemble des bases contenant des ID-RNB
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
