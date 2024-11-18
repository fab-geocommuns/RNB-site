// Types
import { SelectedBuilding } from '@/stores/map/map-slice';

// Comps
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ContributionForm from '@/components/ContributionForm';

// Styles
import { fr } from '@codegouvfr/react-dsfr';
import styles from '@/styles/panelBuilding.module.scss';
import panelStyles from '@/styles/panel.module.scss';

// Analytics
import va from '@vercel/analytics';

// Hooks
import React, { useState, useEffect } from 'react';

// Store
import { bdgApiUrl } from '@/stores/map/map-slice';
import { ContributionStatusPicker } from '@/components/panel/ContributionStatusPicker';
import { BuildingAdresses } from '@/components/panel/adresse/BuildingAdresses';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';

interface BuildingPanelProps {
  bdg: SelectedBuilding;
}

export default function BuildingPanel({ bdg }: BuildingPanelProps) {
  const [copied, setCopied] = useState(false);
  const editing = useSelector((state: RootState) => state.contribution.editing);

  const apiUrl = () => {
    return bdgApiUrl(bdg!.rnb_id);
  };

  function addSpace(rnb_id: string) {
    if (rnb_id) {
      return rnb_id.split('').map((char, i) => {
        let classes = '';
        if (i == 4 || i == 8) {
          classes = styles['small-left-padding'];
        }
        return (
          <span key={'rnb-id-char' + i} className={classes}>
            {char}
          </span>
        );
      });
    } else {
      return null;
    }
  }

  const easyRnbId = () => {
    return addSpace(bdg!.rnb_id);
  };

  const handleCopy = () => {
    va.track('rnbid-copied', { rnb_id: bdg!.rnb_id });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
    if (bdg?.rnb_id !== undefined) {
      va.track('open-side-panel', { rnb_id: bdg.rnb_id });
    }
  }, [bdg?.rnb_id]);

  return (
    <div>
      <div className={panelStyles.section}>
        <h2 className={panelStyles.sectionTitle}>Identifiant RNB</h2>

        <div className={styles.rnbidShell}>
          <div className={styles.rnbidShell__id}>{easyRnbId()}</div>

          <CopyToClipboard onCopy={() => handleCopy()} text={bdg?.rnb_id}>
            <div className={styles.rnbidShell__copy}>
              {copied ? (
                <span>
                  Copié <i className={fr.cx('fr-icon-success-line')}></i>
                </span>
              ) : (
                <span>
                  Copier <i className={fr.cx('fr-icon-clipboard-line')}></i>
                </span>
              )}
            </div>
          </CopyToClipboard>
        </div>
      </div>

      <div className={panelStyles.section}>
        <h2 className={panelStyles.sectionTitle}>Statut du bâtiment</h2>
        <div className={panelStyles.sectionBody}>
          <ContributionStatusPicker currentStatus={bdg.status} />
        </div>
      </div>
      <div className={panelStyles.section}>
        <h2 className={panelStyles.sectionTitle}>Adresses</h2>
        <div className={panelStyles.sectionBody}>
          <BuildingAdresses adresses={bdg.addresses} />
        </div>
      </div>

      {!editing && (
        <div className={panelStyles.section}>
          <h2 className={panelStyles.sectionTitle + ' fr-mb-2v'}>
            Améliorez le RNB
          </h2>
          <ContributionForm />
        </div>
      )}

      <div className={panelStyles.section}>
        <h2 className={panelStyles.sectionTitle}>Correspondances</h2>
        <div className={panelStyles.sectionBody}>
          {bdg?.ext_ids?.length === 0 ? (
            <div>
              <em>Aucun lien avec une autre base de donnée.</em>
            </div>
          ) : (
            bdg?.ext_ids?.map((ext_id) => (
              <div key={ext_id.id} className={panelStyles.sectionListItem}>
                <span>Base de données : {ext_id.source}</span>
                <br />
                <span>Identifiant : {ext_id.id}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={panelStyles.section}>
        <h2 className={panelStyles.sectionTitle}>Lien API</h2>
        <div className={panelStyles.sectionBody}>
          <a href={apiUrl()} target="_blank">
            Format JSON
          </a>
        </div>
      </div>
    </div>
  );
}
