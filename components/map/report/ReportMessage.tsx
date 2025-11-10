import styles from '@/styles/report/message.module.scss';

import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import ReportStatus from '@/components/map/report/ReportStatus';

import type { ReportStatus as ReportStatusType } from 'report';

type Props = {
  message: any;
  status: ReportStatusType | null;
};

export default function ReportMessage({ message, status }: Props) {
  const relativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
      year: 31536000 * 2,
      month: 2592000,
      week: 604800,
      day: 86400, // ... etc
      hour: 3600, // .. after 3600 seconds, express time in hours .
      minute: 60, // after 60 seconds, express time in minutes ..
      second: 1,
    };

    const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

    for (const interval in intervals) {
      const intervalSeconds = intervals[interval];
      if (Math.abs(secondsDiff) >= intervalSeconds || interval === 'second') {
        const value = Math.floor(secondsDiff / intervalSeconds);
        return rtf.format(-value, interval as Intl.RelativeTimeFormatUnit);
      }
    }

    return '';
  };

  return (
    <div className={`${styles.shell} ${status ? styles.withStatus : ''}`}>
      <div className={styles.metaInfos}>
        <span>
          <span className={styles.author}>{message.author.name}</span>
          <Tooltip
            kind="hover"
            title={new Date(message.created_at).toLocaleString()}
          >
            <span className={styles.date}>
              {relativeTime(message.created_at)}
            </span>
          </Tooltip>
        </span>
        {status && <ReportStatus status={status} />}
      </div>
      <div className={styles.text}>{message.text}</div>
    </div>
  );
}
