import VisuMap from '@/components/map/VisuMap';
import AddressSearchMap from '@/components/AddressSearchMap';

import styles from '@/styles/mapPage.module.scss';

export default function Page() {
  return (
    <>
      <div className={styles.map}>
        <AddressSearchMap />

        <div className={styles.map__mapShell}>
          <VisuMap />
        </div>
      </div>
    </>
  );
}
