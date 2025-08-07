import styles from '@/styles/genericPanel.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/stores/store';

interface PanelProps {
  operation?: string | null;
  title: string | null;
  header?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  testId?: string;
  onClose: () => void;
}

export default function GenericPanel({
  operation,
  title,
  header,
  body,
  footer,
  testId,
  onClose,
}: PanelProps) {
  return (
    <div
      className={`${styles.shell} ${operation === 'visualisation' ? styles.visualisationShell : ''}`}
      data-testid={testId}
    >
      <div className={styles.container}>
        <div className={styles.head}>
          <div>
            <h2 className={styles.subtitle}>{title}</h2>
            {header}
          </div>
          <a href="#" onClick={onClose} className={styles.closeLink}>
            <i className="fr-icon-close-line" />
          </a>
        </div>
        <div className={styles.body}>{body}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
