// Styles
import styles from '@/styles/layerSwitcher.module.scss';

// React things
import React, { useEffect, useState } from 'react';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';

// Images
import backgroundSatellite from '@/public/images/map/switch-bckg-sat.jpg';
import backgroundSatellite2016_2020 from '@/public/images/map/switch-bckg-sat-2016-2020.jpg';
import backgroundPlanIGN from '@/public/images/map/switch-bckg-plan-ign.png';
import backgroundPlanOSM from '@/public/images/map/switch-bckg-plan-osm.jpg';
import extraPlots from '@/public/images/map/switch-plots.jpg';
import extraAddresses from '@/public/images/map/switch-addresses.png';
import extraReports from '@/public/images/map/switch-reports.png';
import bdgPoint from '@/public/images/map/switch-bdg-point.png';
import bdgShape from '@/public/images/map/switch-bdg-shape.png';

import layersIcon from '@/public/images/map/layer-group-solid.svg';
import { useHotkeys } from 'react-hotkeys-hook';
import { toasterSuccess } from '@/components/contribution/toaster';
// Components
import ImageNext from 'next/image';
import { StaticImageData } from 'next/image';

// Feature flags
const showReports = process.env.NEXT_PUBLIC_SHOW_REPORTS === 'true';

// Types
import {
  MapBackgroundLayer,
  MapBuildingsLayer,
  MapExtraLayer,
  MapLayer,
} from '@/stores/map/map-slice';

type LayerButtonProps = {
  isAvailable: boolean;
  isActive: boolean;
  label: string;
  onClick: () => void;
  image: StaticImageData;
};

function LayerButton({
  isAvailable,
  isActive,
  label,
  onClick,
  image,
}: LayerButtonProps) {
  const getTitle = () => {
    let image_label = label;
    if (label === 'Satellite' || label === 'Satellite 2016-2020') {
      image_label += ' (shift + s)';
    }
    // TODO: Use a Tooltip for better UX, but we need to update DSFR
    return isAvailable
      ? image_label
      : `Le calque "${label}" n'est pas disponible en mode édition`;
  };
  return (
    <li>
      <a
        href="#"
        className={
          isActive ? styles.active : !isAvailable ? styles.disabled : ''
        }
        onClick={(e) => {
          if (!isAvailable) return;
          e.preventDefault();
          onClick();
        }}
        title={getTitle()}
      >
        <div className={styles.choiceImageShell}>
          <ImageNext src={image} alt={label} className={styles.choiceImage} />
        </div>

        <span className={styles.choiceLabel}>{label}</span>
      </a>
    </li>
  );
}

type Props = {
  disabledLayers?: MapLayer[];
};

export default function LayersSwitcher({ disabledLayers = [] }: Props) {
  // Open or not
  const [open, setOpen] = useState(false);

  // Store
  const dispatch: AppDispatch = useDispatch();
  const mapLayers = useSelector((state: RootState) => state.map.layers);

  const handleChangeBackgroundClick = (background: MapBackgroundLayer) => {
    dispatch(Actions.map.setLayersBackground(background));
  };

  useHotkeys('shift+s', () => {
    if (mapLayers.background !== 'satellite') {
      handleChangeBackgroundClick('satellite');
      toasterSuccess(dispatch, 'Satellite');
    } else {
      handleChangeBackgroundClick('satellite_2016_2020');
      toasterSuccess(dispatch, 'Satellite 2016-2020');
    }
  });

  const handleChangeBuildingLayer = (layer: MapBuildingsLayer) => {
    dispatch(Actions.map.setLayersBuildings(layer));
  };

  const handleExtraLayerClick = (layer: MapExtraLayer) => {
    dispatch(Actions.map.toggleExtraLayer(layer));
  };

  const isAvailable = (layer: MapLayer) => !disabledLayers.includes(layer);

  // Switch background image
  const [btnImage, setBtnImage] = useState(backgroundPlanIGN);

  useEffect(() => {
    switch (mapLayers.background) {
      case 'vectorIgnStandard':
        setBtnImage(backgroundSatellite);

        break;
      case 'vectorOsm':
        setBtnImage(backgroundSatellite);

        break;
      default:
        setBtnImage(backgroundPlanIGN);
        break;
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
                  <LayerButton
                    isAvailable={isAvailable('vectorIgnStandard')}
                    isActive={mapLayers.background === 'vectorIgnStandard'}
                    label="Plan (IGN)"
                    onClick={() =>
                      handleChangeBackgroundClick('vectorIgnStandard')
                    }
                    image={backgroundPlanIGN}
                  />
                  <LayerButton
                    isAvailable={isAvailable('vectorOsm')}
                    isActive={mapLayers.background === 'vectorOsm'}
                    label="Plan (OSM)"
                    onClick={() => handleChangeBackgroundClick('vectorOsm')}
                    image={backgroundPlanOSM}
                  />
                  <LayerButton
                    isAvailable={isAvailable('satellite')}
                    isActive={mapLayers.background === 'satellite'}
                    label="Satellite"
                    onClick={() => handleChangeBackgroundClick('satellite')}
                    image={backgroundSatellite}
                  />
                  <LayerButton
                    isAvailable={isAvailable('satellite_2016_2020')}
                    isActive={mapLayers.background === 'satellite_2016_2020'}
                    label="Satellite 2016-2020"
                    onClick={() =>
                      handleChangeBackgroundClick('satellite_2016_2020')
                    }
                    image={backgroundSatellite2016_2020}
                  />
                </ul>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Bâtiments RNB</h2>
              <div className={styles.sectionBody}>
                <ul className={styles.choicesList}>
                  <LayerButton
                    isAvailable={isAvailable('point')}
                    isActive={mapLayers.buildings === 'point'}
                    label="Points"
                    onClick={() => handleChangeBuildingLayer('point')}
                    image={bdgPoint}
                  />
                  <LayerButton
                    isAvailable={isAvailable('polygon')}
                    isActive={mapLayers.buildings === 'polygon'}
                    label="Polygones"
                    onClick={() => handleChangeBuildingLayer('polygon')}
                    image={bdgShape}
                  />
                </ul>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Extra</h2>
              <div className={styles.sectionBody}>
                <ul className={styles.choicesList}>
                  {showReports && (
                    <LayerButton
                      isAvailable={isAvailable('reports')}
                      isActive={mapLayers.extraLayers.includes('reports')}
                      label="Signalements"
                      onClick={() => handleExtraLayerClick('reports')}
                      image={extraReports}
                    />
                  )}
                  <LayerButton
                    isAvailable={isAvailable('plots')}
                    isActive={mapLayers.extraLayers.includes('plots')}
                    label="Cadastre"
                    onClick={() => handleExtraLayerClick('plots')}
                    image={extraPlots}
                  />
                  <LayerButton
                    isAvailable={isAvailable('addresses')}
                    isActive={mapLayers.extraLayers.includes('addresses')}
                    label="Adresses BAN"
                    onClick={() => handleExtraLayerClick('addresses')}
                    image={extraAddresses}
                  />
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.btn} onClick={(e) => setOpen(true)}>
          <div className={styles.btnIcon}>
            <ImageNext
              src={layersIcon}
              alt="Voir les calques"
              className={styles.btnImg}
            />
          </div>
          <div className={styles.btnImage}>
            <span className={styles.btnLabel}>Calques</span>
            <ImageNext
              src={btnImage}
              alt="Voir les calques"
              className={styles.btnImg}
            />
          </div>
        </div>
      )}
    </>
  );
}
