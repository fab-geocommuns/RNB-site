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

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { useEffect, useMemo } from 'react';
import useClientSidePageTitle from '@/utils/useClientSidePageTitle';
import {
  getDefaultMapLayers,
  MAP_LAYERS_EDITION_COOKIE_KEY,
} from '@/utils/mapLayersDefaults';
import { mapActions } from '@/stores/map/map-slice';

export default function Page() {
  useClientSidePageTitle("Carte d'édition");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(mapActions.setLayersCookieKey(MAP_LAYERS_EDITION_COOKIE_KEY));
  }, [dispatch]);

  // Feature flag
  const showReportPanels = process.env.NEXT_PUBLIC_SHOW_REPORTS === 'true';
  const showSummerGame = process.env.NEXT_PUBLIC_SHOW_SUMMER_GAME === 'true';

  // Map layers from store
  const mapLayers = useSelector((state: RootState) => state.map.layers);

  // On réccupère les fonds de carte depuis les cookies
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
        MAP_LAYERS_EDITION_COOKIE_KEY,
      ),
    [],
  );

  // Summer game : timestamp bumped after each successful edition to refresh the score badge
  const editMapSummerScoreUpdatedAt = useSelector(
    (state: RootState) => state.edition.editMapSummerScoreUpdatedAt,
  );

  const { user } = useRNBAuthentication({ require: true });

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
