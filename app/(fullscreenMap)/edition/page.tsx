'use client';

import EditMap from '@/components/map/EditMap';
import EditionPanel from '@/components/contribution/EditionPanel';
import AddressSearchMap from '@/components/address/AddressSearchMap';
import { useRNBAuthentication } from '@/utils/use-rnb-authentication';

import styles from '@/styles/mapPage.module.scss';

export default function Page() {
  const { user } = useRNBAuthentication({ require: true });

  if (!user) {
    return <>Chargement en cours</>;
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
