// Types
import { SelectedADS } from '@/stores/map/slice';

// Styles
import panelStyles from '@/styles/panel.module.scss';
import adsStyles from '@/styles/panelADS.module.scss';

// Icons
import ImageNext from 'next/image';
import { getADSOperationIcons, getOperationIcon } from '@/logic/ads';

interface ADSPanelProps {
  ads: SelectedADS;
}

export default function ADSPanel({ ads }: ADSPanelProps) {
  const icons = getADSOperationIcons();

  const humanizeOperation = (operation: string) => {
    switch (operation) {
      case 'build':
        return 'Nouveau bâtiment';
      case 'modify':
        return "Modification d'un bâtiment existant";
      case 'demolish':
        return 'Démolition complète';
      default:
        return operation;
    }
  };

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
          Date d&apos;acceptation : {formattedDecidedAt()}
        </div>
      </div>
      <div className={panelStyles.section}>
        <h2 className={panelStyles.sectionTitle}>Opérations</h2>
        <div className={panelStyles.sectionBody}>
          {ads.buildings_operations.map((op, idx) => (
            <div key={idx} className={panelStyles.sectionListItem}>
              <div className={adsStyles.operationShell}>
                <div className={adsStyles.operationIconShell}>
                  <ImageNext
                    src={getOperationIcon(op.operation)}
                    alt={op.operation}
                  />
                </div>
                <div>{humanizeOperation(op.operation)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
