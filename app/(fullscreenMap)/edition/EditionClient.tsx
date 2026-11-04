'use client';

import EditMap from '@/components/map/EditMap';
import EditionPanel from '@/components/contribution/EditionPanel';
import AddressSearchMap from '@/components/address/AddressSearchMap';
import ReportPanels from '@/components/map/report/ReportPanels';
import styles from '@/styles/mapPage.module.scss';
import '@/styles/mapBanLayer.scss';

import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { useMemo } from 'react';
import {
  getDefaultMapLayers,
  MAP_LAYERS_EDITION_KEY,
} from '@/utils/mapLayersDefaults';

// Access is checked by the server page
export default function EditionClient() {
  // Feature flag
  const showReportPanels = process.env.NEXT_PUBLIC_SHOW_REPORTS === 'true';

  // Map layers from store
  const mapLayers = useSelector((state: RootState) => state.map.layers);

  // On récupère les fonds de carte depuis le local storage
  const {
    background: defaultBackgroundLayer,
    buildings: defaultBuildingLayer,
    extraLayers: defaultExtraLayers,
  } = useMemo(
    () =>
      getDefaultMapLayers(
        {
          background: 'satellite',
          buildings: 'polygon',
          extraLayers: ['reports', 'validated'],
        },
        MAP_LAYERS_EDITION_KEY,
      ),
    [],
  );

  return (
    <>
      <div className={styles.map}>
        <AddressSearchMap />
        <EditionPanel />
        {showReportPanels && mapLayers.extraLayers.includes('reports') && (
          <ReportPanels />
        )}
        <div className={styles.map__mapShell}>
          <EditMap
            defaultBackgroundLayer={defaultBackgroundLayer}
            defaultBuildingLayer={defaultBuildingLayer}
            defaultExtraLayers={defaultExtraLayers}
            layersKey={MAP_LAYERS_EDITION_KEY}
            disabledLayers={['point']}
          />
        </div>
      </div>
    </>
  );
}
