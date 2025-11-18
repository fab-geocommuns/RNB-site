import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import styles from '@/styles/report/form.module.scss';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from '@/components/contribution/toaster';

export default function ReportForm({ report }: { report?: any }) {
  const { fetch } = useRNBFetch();
  const dispatch: AppDispatch = useDispatch();

  const [action, setAction] = useState('comment');
  const [message, setMessage] = useState('');

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    resize(e);
  };

  const resize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAction(e.target.value);
  };

  // Change the submut button label based on selected action
  const getSubmitLabel = () => {
    switch (action) {
      case 'fix':
        return 'Marquer comme traité';
      case 'reject':
        return 'Rejeter le signalement';
      default:
        return 'Ajouter un commentaire';
    }
  };

  const getSuccessMessage = () => {
    switch (action) {
      case 'fix':
        return 'Le signalement a été marqué comme traité.';
      case 'reject':
        return 'Le signalement a été rejeté.';
      default:
        return 'Votre commentaire a bien été ajouté.';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = `${process.env.NEXT_PUBLIC_API_BASE}/reports/${report.id}/reply/`;
    const data: { message: string; action: string } = {
      message: message,
      action: action,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Reload the selected report
        // use the setSelectedReport redux action to update the report details panel

        const updatedReport = await response.json();
        setMessage('');

        dispatch(Actions.report.setSelectedReport(updatedReport));
        toasterSuccess(dispatch, getSuccessMessage());
      } else {
        await throwErrorMessageForHumans(response);
      }
    } catch (err: any) {
      toasterError(
        dispatch,
        err.message || "Erreur lors de l'envoi du message",
      );
      console.error(err);
    }
  };

  return (
    <>
      <form method="post" action="" onSubmit={handleSubmit}>
        <input type="hidden" name="reportId" value={report.id} />
        <div>
          <label htmlFor="message" className={styles.formTitle}>
            Votre message
          </label>
          <textarea
            className={`fr-input ${styles.msgInput}`}
            id="message"
            name="message"
            value={message}
            onChange={handleMessageChange}
            required
          ></textarea>
        </div>
        <div className={styles.actionShell}>
          <SegmentedControl
            small={true}
            name="action"
            legend="Votre action"
            segments={[
              {
                label: 'Commenter',
                //iconId: 'fr-icon-check-line',
                nativeInputProps: {
                  defaultChecked: true,
                  value: 'comment',
                  onChange: handleActionChange,
                },
              },
              {
                label: 'Traiter',
                //iconId: 'fr-icon-check-line',
                nativeInputProps: {
                  value: 'fix',
                  onChange: handleActionChange,
                },
              },
              {
                label: 'Rejeter',
                //iconId: 'fr-icon-error-line',
                nativeInputProps: {
                  value: 'reject',
                  onChange: handleActionChange,
                },
              },
            ]}
          />
        </div>
        <div>
          <Button size="small" type="submit">
            {getSubmitLabel()}
          </Button>
        </div>
      </form>
    </>
  );
}
