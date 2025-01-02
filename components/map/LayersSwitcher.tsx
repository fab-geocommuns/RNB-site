// Styles
import styles from '@/styles/layerSwitcher.module.css';

// React things
import React, { useState } from 'react';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';

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

  return (
    <>
      <div className={styles.btn} onClick={(e) => setOpen(true)}>
        Layer switcher
      </div>
      {open && (
        <div className={styles.modal}>
          <div>
            <a href="#" onClick={(e) => setOpen(false)}>
              X
            </a>
          </div>

          <div>
            <p>Fond</p>
            <ul>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleChangeBackgroundClick(e, 'vector')}
                >
                  Plan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleChangeBackgroundClick(e, 'satellite')}
                >
                  Satellite
                </a>
              </li>
            </ul>
            <p>Bâtiments</p>
            <ul>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleChangeBuildingLayer(e, 'point')}
                >
                  Points
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleChangeBuildingLayer(e, 'polygon')}
                >
                  Polygones
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p>Calques</p>
            <ul>
              <li>
                <a href="#" onClick={(e) => handleExtraLayerClick(e, 'plots')}>
                  Cadastre
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
