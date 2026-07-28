'use client';

import EditMap from '@/components/map/EditMap';
import EditionPanel from '@/components/contribution/EditionPanel';
import AddressSearchMap from '@/components/address/AddressSearchMap';
import ReportPanels from '@/components/map/report/ReportPanels';
import EditMapSummerScore from '@/components/games/summerGames/editMapSummerScore';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';
import { Loader } from '@/components/Loader';
import styles from '@/styles/mapPage.module.scss';
import '@/styles/mapBanLayer.scss';

import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { useMemo } from 'react';
import useClientSidePageTitle from '@/utils/useClientSidePageTitle';
import { getDefaultMapLayers } from '@/utils/mapLayersDefaults';
import { useSyncMapLayersCookie } from '@/utils/useSyncMapLayersCookie';

export default function Page() {
  useClientSidePageTitle("Carte d'édition");

  // Feature flag
  const showReportPanels = process.env.NEXT_PUBLIC_SHOW_REPORTS === 'true';
  const showSummerGame = process.env.NEXT_PUBLIC_SHOW_SUMMER_GAME === 'true';

  // Map layers from store
  const mapLayers = useSyncMapLayersCookie();

  // Summer game : timestamp bumped after each successful edition to refresh the score badge
  const editMapSummerScoreUpdatedAt = useSelector(
    (state: RootState) => state.edition.editMapSummerScoreUpdatedAt,
  );

  const { user } = useRNBAuthentication({ require: true });

  const {
    background: defaultBackgroundLayer,
    buildings: defaultBuildingLayer,
    extraLayers: defaultExtraLayers,
  } = useMemo(
    () =>
      getDefaultMapLayers({
        background: 'satellite',
        buildings: 'polygon',
        extraLayers: ['reports', 'validated'],
      }),
    [],
  );

  if (!user) {
    return (
      <>
        <div className={styles.loaderWrapper}>
          <span>Chargement en cours</span>
          <Loader></Loader>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.map}>
        <AddressSearchMap />
        <EditionPanel />
        {showSummerGame && (
          <EditMapSummerScore
            updatedAt={editMapSummerScoreUpdatedAt || 0}
            username={user.username}
          />
        )}
        {showReportPanels && mapLayers.extraLayers.includes('reports') && (
          <ReportPanels />
        )}
        <div className={styles.map__mapShell}>
          <EditMap
            defaultBackgroundLayer={defaultBackgroundLayer}
            defaultBuildingLayer={defaultBuildingLayer}
            defaultExtraLayers={defaultExtraLayers}
            disabledLayers={['point']}
          />
        </div>
      </div>
    </>
  );
}
