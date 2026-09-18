import { fr } from '@codegouvfr/react-dsfr';
import styles from '@/styles/home/maintenanceBlock.module.scss';

export default function MaintenanceBlock() {
  return (
    <section
      className={`${styles.block} ${fr.cx('fr-mb-6v', 'fr-py-4v')}`}
      aria-labelledby="maintenance-block-title"
    >
      <div className={fr.cx('fr-container')}>
        <div className={fr.cx('fr-grid-row', 'fr-grid-row--middle')}>
          <div className={fr.cx('fr-col-12')}>
            <h2
              id="maintenance-block-title"
              className={`${styles.title} ${fr.cx('fr-h5', 'fr-mb-1v', 'fr-icon-tools-line', 'fr-icon--sm')}`}
            >
              RNB : maintenance
            </h2>
            <p className={fr.cx('fr-text--sm', 'fr-mb-0')}>
              Le service est actuellement en maintenance. Certaines
              fonctionnalités peuvent être temporairement indisponibles.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
