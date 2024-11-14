'use client';

import styles from '@/styles/alerts.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/map/store';
import Alert from '@codegouvfr/react-dsfr/Alert';

export function Alerts() {
  const alerts = useSelector((state: RootState) => state.app.alerts);

  return (
    <div className={styles.alerts}>
      {alerts.map((alert) => (
        <Alert
          {...alert}
          className={alert.className + ' ' + styles.alert}
          key={alert.id}
        />
      ))}
    </div>
  );
}
