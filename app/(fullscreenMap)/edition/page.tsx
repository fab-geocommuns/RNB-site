'use client';

import EditMap from '@/components/map/EditMap';
import EditionPanel from '@/components/contribution/EditionPanel';
import AddressSearchMap from '@/components/address/AddressSearchMap';
import SummerChallenge from '@/components/summerGames/SummerChallenge';
import { useRNBAuthentication } from '@/utils/use-rnb-authentication';

import styles from '@/styles/mapPage.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';

export default function Page() {
  const { user } = useRNBAuthentication({ require: true });

  // Summer challenge
  const summerChallengeBadgeUpdatedAt = useSelector(
    (state: RootState) => state.edition.summerChallengeBadgeUpdatedAt,
  );

  if (!user) {
    return <>Chargement en cours</>;
  }

  return (
    <>
      <div className={styles.map}>
        <AddressSearchMap />
        <EditionPanel />
        <SummerChallenge updatedAt={summerChallengeBadgeUpdatedAt || 0} />

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
