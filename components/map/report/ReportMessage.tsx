import styles from '@/styles/report/message.module.scss';

export default function ReportMessage({ message }: { message: any }) {
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
    <div className={styles.shell}>
      <div className={styles.metaInfos}>
        <span className={styles.author}>{message.author.name}</span>
        <span className={styles.date}>{relativeTime(message.created_at)}</span>
      </div>
      <div>{message.text}</div>
    </div>
  );
}
