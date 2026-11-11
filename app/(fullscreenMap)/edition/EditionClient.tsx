'use client';

import EditMap from '@/components/map/EditMap';
import EditionPanel from '@/components/contribution/EditionPanel';
import AddressSearchMap from '@/components/address/AddressSearchMap';
import ReportPanels from '@/components/map/report/ReportPanels';
import styles from '@/styles/mapPage.module.scss';
import '@/styles/mapBanLayer.scss';

import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { loginUrl } from '@/utils/useRNBAuthentication';
import {
  getDefaultMapLayers,
  MAP_LAYERS_EDITION_KEY,
} from '@/utils/mapLayersDefaults';

// Access is checked by the server page on load
export default function EditionClient() {
  // The session can still be lost while the page is open (sign-out in another
  // tab, expired cookie noticed on refetch): send the user back to the login
  const { status } = useSession();
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = loginUrl();
    }
  }, [status]);

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
