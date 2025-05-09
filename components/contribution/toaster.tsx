import Notice from '@codegouvfr/react-dsfr/Notice';
import styles from '@/styles/contribution/editPanel.module.scss';

export default function Toaster({
  success,
  successMsg,
  errorMsg,
}: {
  success: boolean;
  successMsg: string;
  errorMsg: string | null;
}) {
  return (
    <>
      <div className={styles.noticeContainer}>
        <div
          className={`${styles.notice} ${success || errorMsg ? styles.noticeVisible : ''}`}
        >
          {success && <Notice title={successMsg} severity="info" />}
          {errorMsg && <Notice title={errorMsg} severity="warning" />}
        </div>
      </div>
    </>
  );
}
