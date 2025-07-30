// Types
// Store
import { bdgApiUrl, Plot, SelectedBuilding } from '@/stores/map/map-slice';

// Comps
import CopyToClipboard from '@/components/util/CopyToClipboard';
import ContributionForm from '@/components/ContributionForm';
import DeployableBlock from '@/components/DeployableBlock';
import BdTopoBdnbContent from '@/components/BdTopoBdnbContent';

// Styles
import { fr } from '@codegouvfr/react-dsfr';
import styles from '@/styles/panelBuilding.module.scss';
import panelStyles from '@/styles/panel.module.scss';

// Analytics
import va from '@vercel/analytics';

// Hooks
import React, { useEffect, useState } from 'react';
import { ContributionStatusPicker } from '@/components/panel/ContributionStatusPicker';
import { BuildingAdresses } from '@/components/panel/adresse/BuildingAdresses';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';

interface BuildingPanelProps {
  bdg: SelectedBuilding;
}

export default function BuildingPanel({ bdg }: BuildingPanelProps) {
  const [copied, setCopied] = useState(false);

  // Store
  const dispatch: AppDispatch = useDispatch();
  const mapLayers = useSelector((state: RootState) => state.map.layers);

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

  const coverRatioDisplay = (ratio: number) => {
    // % with two decimals
    const percentage = (ratio * 100).toFixed(2);

    return `${percentage}%`;
  };

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

  const relevantPlots = (): Plot[] => {
    const plots =
      bdg?.plots?.filter((plot: Plot) => {
        // We only show plots that cover more than 5% of the building
        return plot.bdg_cover_ratio > 0.05;
      }) || [];

    // Sort plots by desc cover ratio
    plots.sort((a: Plot, b: Plot) => b.bdg_cover_ratio - a.bdg_cover_ratio);

    return plots;
  };

  const handlePlotBtnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(Actions.map.toggleExtraLayer('plots'));
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

      <div className={panelStyles.section}>
        <h2 className={panelStyles.sectionTitle + ' fr-mb-2v'}>
          Améliorez le RNB
        </h2>
        <ContributionForm />
      </div>
      <div className={panelStyles.section}>
        <DeployableBlock
          title="Correspondances BD Topo & BDNB"
          className="blue"
        >
          <BdTopoBdnbContent building={bdg} />
        </DeployableBlock>
      </div>

      <div className={panelStyles.section}>
        <DeployableBlock title="Parcelles cadastrales" className="blue">
          <>
            <div className={panelStyles.plotWarning}>
              Les parcelles sont associées au bâtiment{' '}
              <b>via un croisement géométrique</b> et non administratif. <br />
              <a
                target="_blank"
                href="https://rnb-fr.gitbook.io/documentation/repository-rnb-coeur/proprietes-dun-batiment/parcelles-cadastrales"
              >
                En savoir plus
              </a>
            </div>
            {relevantPlots().length === 0 ? (
              <small className="fr-text--sm fr-text--grey fr-ml-2v">
                Pas de parcelles associées à ce bâtiment
              </small>
            ) : (
              <>
                <div className="fr-table fr-table--sm fr-table--no-scroll fr-table--bordered fr-m-0-5v">
                  <div className="fr-table__wrapper">
                    <div className="fr-table__container">
                      <div className="fr-table__content">
                        <table>
                          <thead>
                            <tr>
                              <th>Parcelle</th>
                              <th>Recouvrement du bâtiment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {relevantPlots().map((plot: Plot) => {
                              return (
                                <tr key={plot.id}>
                                  <td>{plot.id}</td>
                                  <td className={panelStyles.coverRatioCell}>
                                    {coverRatioDisplay(plot.bdg_cover_ratio)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="fr-mt-6v">
              <a
                href="#"
                className="fr-btn fr-btn--sm fr-btn--tertiary"
                onClick={(e) => handlePlotBtnClick(e)}
              >
                {mapLayers.extraLayers.includes('plots') ? (
                  <span>Cacher les parcelles</span>
                ) : (
                  <span>Afficher les parcelles sur la carte</span>
                )}
              </a>
            </div>
          </>
        </DeployableBlock>
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
