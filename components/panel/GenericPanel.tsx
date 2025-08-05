import styles from '@/styles/genericPanel.module.scss';

interface PanelProps {
  title: string | null;
  contentHeader?: React.ReactNode;
  contentBody: React.ReactNode;
  contentFooter?: React.ReactNode;
  triggerClose: () => void;
}

export default function GenericPanel({
  title,
  contentHeader,
  contentBody,
  contentFooter,
  triggerClose,
}: PanelProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div>
            <h2 className={styles.subtitle}>{title}</h2>
            {contentHeader}
          </div>
          <a href="#" onClick={triggerClose} className={styles.closeLink}>
            <i className="fr-icon-close-line" />
          </a>
        </div>
        <div className={styles.body}>{contentBody}</div>
        <div className={styles.footer}>{contentFooter}</div>
      </div>
    </div>
  );
}
