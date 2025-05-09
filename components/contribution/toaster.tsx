import Notice from '@codegouvfr/react-dsfr/Notice';
import styles from '@/styles/contribution/editPanel.module.scss';

export async function throwErrorMessageForHumans(response: Response) {
  const errorData = await response.json();
  if (errorData.detail) {
    throw new Error(errorData.detail);
  }

  if (typeof errorData === 'object') {
    const messages = Object.entries(errorData)
      .map(
        ([field, messages]) =>
          `${field} : ${(messages as string[]).join(', ')}`,
      )
      .join('\n');
    throw new Error(messages);
  }

  throw new Error('Erreur inconnue');
}

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
