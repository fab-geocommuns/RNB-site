import Notice from '@codegouvfr/react-dsfr/Notice';
import styles from '@/styles/contribution/editPanel.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState, store } from '@/stores/store';
import { useEffect, useState } from 'react';

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
    Actions.edition.setToasterInfos({
      state: 'success',
      message: msg,
    }),
  );

  // Summer challenge 2025
  // This is a hacky plug to update the badge when a successful operation occurs.
  // Ideally, we should have a more structured way to handle this.
  store.dispatch(Actions.edition.setSummerChallengeBadgeUpdatedAt(Date.now()));
}

export function toasterError(dispatch: AppDispatch, msg: string) {
  dispatch(
    Actions.edition.setToasterInfos({
      state: 'error',
      message: msg,
    }),
  );
}

export function toasterReset(dispatch: AppDispatch) {
  dispatch(
    Actions.edition.setToasterInfos({
      state: null,
      message: '',
    }),
  );
}

export default function Toaster() {
  const toasterInfos = useSelector(
    (state: RootState) => state.edition.toasterInfos,
  );
  const [showToaster, setShowToaster] = useState(false);

  useEffect(() => {
    if (toasterInfos.state) {
      setShowToaster(true);
      const timer = setTimeout(
        () => {
          setShowToaster(false);
        },
        toasterInfos.state === 'success' ? 6000 : 12000,
      );
      return () => clearTimeout(timer);
    } else {
      setShowToaster(false);
    }
  }, [toasterInfos]);

  return (
    <>
      <div className={styles.noticeContainer} data-testid="toaster">
        <div
          className={`${styles.notice} ${showToaster ? styles.noticeVisible : ''}`}
        >
          {showToaster && (
            <Notice
              title={toasterInfos.message}
              severity={toasterInfos.state === 'success' ? 'info' : 'warning'}
            />
          )}
        </div>
      </div>
    </>
  );
}
