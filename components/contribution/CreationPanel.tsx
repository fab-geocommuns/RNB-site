import RNBIDHeader from './RNBIDHeader';
import styles from '@/styles/contribution/editPanel.module.scss';

function PanelBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

export default function CreationPanel() {
  return (
    <>
      <RNBIDHeader>
        <span className="fr-text--xs">Créer un nouveau bâtiment</span>
      </RNBIDHeader>
      <PanelBody>
        <div className={styles.panelSection}>
          <span className={`fr-text--xs ${styles.sectionTitle}`}>étape 1</span>
          <div>Tracez la géométrie du bâtiment sur la carte.</div>

          <div>
            Pour terminer le tracé, fermez le polygone en recliquant sur le
            premier point que vous avez placé.
          </div>
        </div>
      </PanelBody>
    </>
  );
}
