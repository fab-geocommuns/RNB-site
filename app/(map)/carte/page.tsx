'use client';

// Styles
import styles from '@/styles/mapPage.module.scss';
import '@/styles/mapBanLayer.scss';

// Hooks
import { useEffect } from 'react';
import useClientSidePageTitle from '@/utils/useClientSidePageTitle';

// Components
import VisuMap from '@/components/map/VisuMap';
import VisuPanel from '@/components/VisuPanel';
import AddressSearchMap from '@/components/address/AddressSearchMap';
import ReportPanels from '@/components/map/report/ReportPanels';
import HelpSourcePanel, {
  useHelpVariation,
} from '@/components/HelpSourcePanel';
import VisuMapSummerScore from '@/components/games/summerGames/visuMapSummerScore';

// Analytics
import va from '@vercel/analytics';

// Bus
import Bus from '@/utils/Bus';

// Store
import { useMemo } from 'react';

// Types
import { getDefaultMapLayers, MAP_LAYERS_KEY } from '@/utils/mapLayersDefaults';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';

export default function RNBMap() {
  useClientSidePageTitle('Carte des bâtiments');

  // Feature flag
  const showReportPanels = process.env.NEXT_PUBLIC_SHOW_REPORTS === 'true';
  const showSummerGame = process.env.NEXT_PUBLIC_SHOW_SUMMER_GAME === 'true';

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
          background: 'vectorIgnStandard',
          buildings: 'point',
          extraLayers: ['ads', 'validated'],
        },
        MAP_LAYERS_KEY,
      ),
    [],
  );

  // //////////////////////
  // Tracking address search
  // @ts-ignore
  const trackAddressSearch = (address) => {
    va.track('address-search-public-map', {
      query: address.label,
      result_insee_code: address.insee_code,
    });
  };

  const { variation: helpVariation, defaultOpen: helpDefaultOpen } =
    useHelpVariation();

  useEffect(() => {
    Bus.on('address:search', trackAddressSearch);
    return () => {
      Bus.off('address:search', trackAddressSearch);
    };
  }, []);

  // //////////////////////
  // Track RNB ID searched in the search bar
  // @ts-ignore
  const trackRNBIDSearch = (infos) => {
    va.track('rnbid-search-public-map', {
      rnb_id: infos.rnb_id,
    });
  };

  useEffect(() => {
    Bus.on('rnbid:search', trackRNBIDSearch);
    return () => {
      Bus.off('rnbid:search', trackRNBIDSearch);
    };
  });

  return (
    <>
      <div className={styles.map}>
        <AddressSearchMap />
        <VisuPanel />
        {showSummerGame && <VisuMapSummerScore />}
        {showReportPanels && mapLayers.extraLayers.includes('reports') && (
          <ReportPanels />
        )}
        {helpVariation && (
          <HelpSourcePanel
            defaultOpen={helpDefaultOpen}
            variation={helpVariation}
          />
        )}

        <div className={styles.map__mapShell}>
          <VisuMap
            defaultBackgroundLayer={defaultBackgroundLayer}
            defaultBuildingLayer={defaultBuildingLayer}
            defaultExtraLayers={defaultExtraLayers}
            layersKey={MAP_LAYERS_KEY}
          />
        </div>
      </div>
    </>
  );
}
