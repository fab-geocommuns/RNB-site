'use client';

import EditMap from '@/components/map/EditMap';
import EditionPanel from '@/components/contribution/EditionPanel';
import AddressSearchMap from '@/components/address/AddressSearchMap';

import { useRNBAuthentication } from '@/utils/use-rnb-authentication';
import { Loader } from '@/components/Loader';
import styles from '@/styles/mapPage.module.scss';
import '@/styles/mapBanLayer.scss';

export default function Page() {
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
