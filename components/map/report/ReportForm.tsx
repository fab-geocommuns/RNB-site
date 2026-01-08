import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import styles from '@/styles/report/form.module.scss';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from '@/components/contribution/toaster';
import { Report } from '@/types/report';

import FeveFound from '@/components/games/feve/feveFound';

type FormAction = 'comment' | 'fix' | 'reject';

export default function ReportForm({ report }: { report: Report }) {
  const { fetch } = useRNBFetch();
  const dispatch: AppDispatch = useDispatch();

  const [action, setAction] = useState<FormAction>('comment');
  const [message, setMessage] = useState('');

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    resize(e);
  };

  const resize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Change the submut button label based on selected action
  const getSubmitLabel = () => {
    switch (action) {
      case 'fix':
        return 'Marquer comme traité';
      case 'reject':
        return 'Rejeter le signalement';
      case 'comment':
        return 'Ajouter un commentaire';
      default:
        throw new Error('Invalid action on report form: ' + action);
    }
  };

  const getSuccessMessage = () => {
    switch (action) {
      case 'fix':
        return 'Le signalement a été marqué comme traité';
      case 'reject':
        return 'Le signalement a été rejeté';
      case 'comment':
        return 'Votre commentaire a bien été ajouté';
      default:
        throw new Error('Invalid action on report form: ' + action);
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
        dispatch(Actions.report.setLastReportUpdate());
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
          <RadioButtons
            name="action"
            legend="Votre action"
            small={true}
            className={styles.actionInput}
            options={[
              {
                label: 'Commenter',
                hintText: 'Laisser un simple message',
                nativeInputProps: {
                  checked: action === 'comment',
                  onChange: () => setAction('comment'),
                },
              },
              {
                label: 'Marquer comme traité',
                hintText: 'Fermer le signalement car il est déjà corrigé',
                nativeInputProps: {
                  checked: action === 'fix',
                  onChange: () => setAction('fix'),
                },
              },
              {
                label: 'Rejeter',
                hintText: 'Fermer le signalement car il est non pertinent',
                nativeInputProps: {
                  checked: action === 'reject',
                  onChange: () => setAction('reject'),
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
      <FeveFound showModal={true} />
    </>
  );
}
