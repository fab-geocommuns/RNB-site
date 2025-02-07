// Styles
import styles from '@/styles/layerSwitcher.module.scss';

// React things
import React, { useEffect, useState } from 'react';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';

// Images
import bckgSat from '@/public/images/map/switch-bckg-sat.jpg';
import bckgPlan from '@/public/images/map/switch-bckg-plan.jpg';
import extraPlots from '@/public/images/map/switch-plots.jpg';

// Components
import ImageNext from 'next/image';

// Types
import {
  MapBackgroundLayer,
  MapBuildingsLayer,
  MapExtraLayer,
} from '@/stores/map/map-slice';

export default function LayersSwitcher() {
  // Open or not
  const [open, setOpen] = useState(false);

  // Store
  const dispatch: AppDispatch = useDispatch();
  const mapLayers = useSelector((state: RootState) => state.map.layers);

  const handleChangeBackgroundClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    background: MapBackgroundLayer,
  ) => {
    e.preventDefault();
    dispatch(Actions.map.setLayersBackground(background));
  };

  const handleChangeBuildingLayer = (
    e: React.MouseEvent<HTMLAnchorElement>,
    layer: MapBuildingsLayer,
  ) => {
    e.preventDefault();
    dispatch(Actions.map.setLayersBuildings(layer));
  };

  const handleExtraLayerClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    layer: MapExtraLayer,
  ) => {
    e.preventDefault();
    dispatch(Actions.map.toggleExtraLayer(layer));
  };

  // Switch background image
  const [btnImage, setBtnImage] = useState(bckgSat);

  useEffect(() => {
    if (mapLayers.background === 'vector') {
      setBtnImage(bckgSat);
    }

    if (mapLayers.background === 'satellite') {
      setBtnImage(bckgPlan);
    }
  }, [mapLayers]);

  return (
    <>
      {open ? (
        <div className={styles.modal}>
          <div className={styles.head}>
            <div className={styles.title}>Calques</div>
            <a
              className={styles.closeLink}
              href="#"
              onClick={(e) => setOpen(false)}
            >
              <i className="fr-icon-close-line" />
            </a>
          </div>
          <div className={styles.body}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Fonds de carte</h2>
              <div className={styles.sectionBody}>
                <ul className={styles.choicesList}>
                  <li>
                    <a
                      href="#"
                      className={
                        mapLayers.background === 'vector' ? styles.active : ''
                      }
                      onClick={(e) => handleChangeBackgroundClick(e, 'vector')}
                    >
                      <div className={styles.choiceImageShell}>
                        <ImageNext
                          src={bckgPlan}
                          alt="Plan"
                          className={styles.choiceImage}
                        />
                      </div>

                      <span className={styles.choiceLabel}>Plan IGN</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={
                        mapLayers.background === 'satellite'
                          ? styles.active
                          : ''
                      }
                      onClick={(e) =>
                        handleChangeBackgroundClick(e, 'satellite')
                      }
                    >
                      <div className={styles.choiceImageShell}>
                        <ImageNext
                          src={bckgSat}
                          alt="Satellite"
                          className={styles.choiceImage}
                        />
                      </div>
                      <span className={styles.choiceLabel}>Satellite</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Bâtiments RNB</h2>
              <div className={styles.sectionBody}>
                <ul className={styles.choicesList}>
                  <li>
                    <a
                      href="#"
                      className={
                        mapLayers.buildings === 'point' ? styles.active : ''
                      }
                      onClick={(e) => handleChangeBuildingLayer(e, 'point')}
                    >
                      <span className={styles.choiceLabel}>Points</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={
                        mapLayers.buildings === 'polygon' ? styles.active : ''
                      }
                      onClick={(e) => handleChangeBuildingLayer(e, 'polygon')}
                    >
                      <span className={styles.choiceLabel}>Polygones</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Extras</h2>
              <div className={styles.sectionBody}>
                <ul className={styles.choicesList}>
                  <li>
                    <a
                      href="#"
                      className={
                        mapLayers.extraLayers.includes('plots')
                          ? styles.active
                          : ''
                      }
                      onClick={(e) => handleExtraLayerClick(e, 'plots')}
                    >
                      <div className={styles.choiceImageShell}>
                        <ImageNext
                          src={extraPlots}
                          alt="Cadastre"
                          className={styles.choiceImage}
                        />
                      </div>
                      <span className={styles.choiceLabel}>Cadastre</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.btn} onClick={(e) => setOpen(true)}>
          <span className={styles.btnLabel}>Calques</span>
          <ImageNext
            src={btnImage}
            alt="Voir les calques"
            className={styles.btnImg}
          />
        </div>
      )}
    </>
  );
}
