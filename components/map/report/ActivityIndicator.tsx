import styles from '@/styles/report/activityIndicator.module.scss';

import { useState } from 'react';
import { useRef } from 'react';

export default function ActivityIndicator({
  closedReportCount,
}: {
  closedReportCount: number;
}) {
  const [isGlowing, setIsGlowing] = useState(false);
  const prevClosedCountRef = useRef<number | null>(null);

  if (prevClosedCountRef.current !== null) {
    if (closedReportCount !== prevClosedCountRef.current) {
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 3000);
    }
  }
  prevClosedCountRef.current = closedReportCount;

  return (
    <>
      <div className={`${styles.led} ${isGlowing ? styles.active : ''}`}></div>
    </>
  );
}
