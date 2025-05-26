// Types
// Store
import { bdgApiUrl, SelectedBuilding } from '@/stores/map/map-slice';

// Comps
import CopyToClipboard from '@/components/util/CopyToClipboard';
import ContributionForm from '@/components/ContributionForm';

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
import { RNBGroup, useRNBAuthentication } from '@/utils/use-rnb-authentication';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';

interface BuildingPanelProps {
  bdg: SelectedBuilding;
}

export default function BuildingPanel({ bdg }: BuildingPanelProps) {
  const [copied, setCopied] = useState(false);
  const { is } = useRNBAuthentication();

  const [openSections, setOpenSections] = useState<string[]>([]);

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

  // @ts-ignore
  const toggleSection = (e, section: string) => {
    e.preventDefault();

    if (openSections.includes(section)) {
      setOpenSections(openSections.filter((s) => s !== section));
    } else {
      setOpenSections([...openSections, section]);
    }
  };

  const relevantPlots = () => {
    const plots = bdg?.plots.filter((plot) => {
      // We only show plots that cover more than 5% of the building
      return plot.bdg_cover_ratio > 0.05;
    });

    // Sort plots by desc cover ratio
    plots.sort((a, b) => b.bdg_cover_ratio - a.bdg_cover_ratio);

    return plots;
  };

  const handlePlotBtnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(Actions.map.toggleExtraLayer('plots'));
  };

  const isSectionOpen = (section: string) => {
    return openSections.includes(section);
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

      {!is(RNBGroup.CONTRIBUTORS) && (
        <div className={panelStyles.section}>
          <h2 className={panelStyles.sectionTitle + ' fr-mb-2v'}>
            Améliorez le RNB
          </h2>
          <ContributionForm />
        </div>
      )}

      <div className={panelStyles.section}>
        <h2
          className={`${panelStyles.sectionTitle} ${panelStyles.sectionTitle__openable}`}
        >
          <a
            href="#"
            className={` ${panelStyles.sectionToggler} ${isSectionOpen('correspondances') ? panelStyles.sectionTogglerOpen : ''}`}
            onClick={(e) => toggleSection(e, 'correspondances')}
          >
            <span className={panelStyles.sectionTogglerIcon}>▸</span>
            Correspondances BD Topo & BDNB
          </a>
        </h2>
        {isSectionOpen('correspondances') && (
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
        )}
      </div>

      <div className={panelStyles.section}>
        <h2
          className={`${panelStyles.sectionTitle} ${panelStyles.sectionTitle__openable}`}
        >
          <a
            href="#"
            className={` ${panelStyles.sectionToggler} ${isSectionOpen('parcelles') ? panelStyles.sectionTogglerOpen : ''}`}
            onClick={(e) => toggleSection(e, 'parcelles')}
          >
            <span className={panelStyles.sectionTogglerIcon}>▸</span>
            Parcelles cadastrales
          </a>
        </h2>
        {isSectionOpen('parcelles') && (
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

            {bdg?.plots?.length === 0 ? (
              <>Pas de parcelles</>
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
                            {relevantPlots().map((plot) => {
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
        )}
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
