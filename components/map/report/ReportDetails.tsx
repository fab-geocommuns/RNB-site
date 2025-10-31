import styles from '@/styles/genericPanel.module.scss';

export default function ReportDetails() {
  const onClose = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    console.log('TODO: handle close report details panel');
  };

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.subtitle}>Signalement</h2>
        </div>
        <a href="#" onClick={onClose} className={styles.closeLink}>
          <i className="fr-icon-close-line" />
        </a>
      </div>
    </div>
  );
}
