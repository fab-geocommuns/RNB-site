// Types
import { SelectedADS } from '@/stores/map/slice';

// Styles
import panelStyles from '@/styles/panel.module.scss';

interface ADSPanelProps {
  ads: SelectedADS;
}

export default function ADSPanel({ ads }: ADSPanelProps) {
  const formattedDecidedAt = () => {
    const date = new Date(ads.decided_at);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className={panelStyles.section}>
        <h2 className={panelStyles.sectionTitle}>Dossier</h2>
        <div className={panelStyles.sectionBody}>
          N° de dossier : {ads.file_number}
          <br />
          Date d'acceptation : {formattedDecidedAt()}
        </div>
      </div>
      <div className={panelStyles.section}>
        <h2 className={panelStyles.sectionTitle}>Opérations</h2>
        <div className={panelStyles.sectionBody}>
          {ads.buildings_operations.map((op, idx) => (
            <div key={idx} className={panelStyles.sectionListItem}>
              {op.operation}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
