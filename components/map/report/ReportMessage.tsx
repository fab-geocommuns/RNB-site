import styles from '@/styles/report/message.module.scss';

export default function ReportMessage({ message }: { message: any }) {
  return (
    <div className={styles.shell}>
      <div className={styles.metaInfos}>
        <span className={styles.author}>{message.author.name}</span>
        <span className={styles.date}>
          {new Date(message.created_at).toLocaleString()}
        </span>
      </div>
      <div>{message.text}</div>
    </div>
  );
}
