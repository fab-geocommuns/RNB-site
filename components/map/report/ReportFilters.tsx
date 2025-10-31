import styles from '@/styles/genericPanel.module.scss';

export default function ReportFilters() {
  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.subtitle}>Signalements</h2>
        </div>
        <a href="#" className={styles.closeLink}>
          <i className="fr-icon-arrow-down-s-line" />
        </a>
      </div>
    </div>
  );
}
