'use client';

// Styles
import styles from '@/styles/mapPage.module.scss';
import '@/styles/mapBanLayer.scss';

// Hooks
import { useEffect } from 'react';

// Components
import VisuMap from '@/components/map/VisuMap';
import VisuPanel from '@/components/VisuPanel';
import AddressSearchMap from '@/components/address/AddressSearchMap';

// Analytics
import va from '@vercel/analytics';

// Bus
import Bus from '@/utils/Bus';
import VisuMapSummerScore from '@/components/summerGames/visuMapSummerScore';

export default function RNBMap() {
  // //////////////////////
  // Tracking address search
  // @ts-ignore
  const trackAddressSearch = (address) => {
    va.track('address-search-public-map', {
      query: address.label,
      result_insee_code: address.insee_code,
    });
  };

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
        <VisuMapSummerScore />

        <div className={styles.map__mapShell}>
          <VisuMap />
        </div>
      </div>
    </>
  );
}
