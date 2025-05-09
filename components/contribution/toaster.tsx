import Notice from '@codegouvfr/react-dsfr/Notice';
import styles from '@/styles/contribution/editPanel.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState, store } from '@/stores/store';
import { useEffect } from 'react';

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

export function toasterSuccess(dispatch: AppDispatch, msg: string) {
  dispatch(
    Actions.map.setToasterInfos({
      success: true,
      successMsg: msg,
      errorMsg: '',
    }),
  );
}

export function toasterError(dispatch: AppDispatch, msg: string) {
  dispatch(
    Actions.map.setToasterInfos({
      success: false,
      successMsg: '',
      errorMsg: msg,
    }),
  );
}

export function toasterReset(dispatch: AppDispatch) {
  toasterSuccess(dispatch, '');
}

export default function Toaster() {
  const toasterInfos = useSelector(
    (state: RootState) => state.map.toasterInfos,
  );
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(
      () => {
        toasterReset(dispatch);
      },
      toasterInfos.success ? 4000 : 10000,
    );
    return () => clearTimeout(timer);
  }, [toasterInfos]);

  return (
    <>
      <div className={styles.noticeContainer}>
        <div
          className={`${styles.notice} ${toasterInfos.successMsg || toasterInfos.errorMsg ? styles.noticeVisible : ''}`}
        >
          {toasterInfos.success && (
            <Notice title={toasterInfos.successMsg} severity="info" />
          )}
          {toasterInfos.errorMsg && (
            <Notice title={toasterInfos.errorMsg} severity="warning" />
          )}
        </div>
      </div>
    </>
  );
}
