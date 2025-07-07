'use client';

import EditMap from '@/components/map/EditMap';
import EditionPanel from '@/components/contribution/EditionPanel';
import AddressSearchMap from '@/components/address/AddressSearchMap';
import EditMapSummerScore from '@/components/summerGames/editMapSummerScore';
import { useRNBAuthentication } from '@/utils/use-rnb-authentication';

import styles from '@/styles/mapPage.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';

export default function Page() {
  const { user } = useRNBAuthentication({ require: true });

  // Summer challenge
  const editMapSummerScoreUpdatedAt = useSelector(
    (state: RootState) => state.edition.editMapSummerScoreUpdatedAt,
  );

  if (!user) {
    return <>Chargement en cours</>;
  }

  return (
    <>
      <div className={styles.map}>
        <AddressSearchMap />
        <EditionPanel />
        <EditMapSummerScore updatedAt={editMapSummerScoreUpdatedAt || 0} />

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
