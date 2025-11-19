'use client';

import EditMap from '@/components/map/EditMap';
import EditionPanel from '@/components/contribution/EditionPanel';
import AddressSearchMap from '@/components/address/AddressSearchMap';
import ReportPanels from '@/components/map/report/ReportPanels';
import { useRNBAuthentication } from '@/utils/use-rnb-authentication';
import { Loader } from '@/components/Loader';
import styles from '@/styles/mapPage.module.scss';
import '@/styles/mapBanLayer.scss';

import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';

export default function Page() {
  // Feature flag
  const showReportPanels = process.env.NEXT_PUBLIC_SHOW_REPORTS === 'true';

  // Map layers from store
  const mapLayers = useSelector((state: RootState) => state.map.layers);

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
        {showReportPanels && mapLayers.extraLayers.includes('reports') && (
          <ReportPanels />
        )}
        <div className={styles.map__mapShell}>
          <EditMap
            defaultBackgroundLayer="satellite"
            defaultBuildingLayer="polygon"
            disabledLayers={['point']}
          />
        </div>
      </div>
    </>
  );
}
