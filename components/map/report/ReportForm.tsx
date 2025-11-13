import { useState } from 'react';
import styles from '@/styles/report/form.module.scss';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Button from '@codegouvfr/react-dsfr/Button';

export default function ReportForm({ report }: { report?: any }) {
  const [action, setAction] = useState('comment');

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

  return (
    <form method="post" action="">
      <input type="hidden" name="reportId" value={report.id} />
      <div>
        <label htmlFor="message" className={styles.formTitle}>
          Votre message
        </label>
        <textarea
          className={`fr-input ${styles.msgInput}`}
          id="message"
          name="message"
          required
          onChange={resize}
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
              iconId: 'fr-icon-check-line',
              nativeInputProps: {
                defaultChecked: true,
                value: 'comment',
                onChange: handleActionChange,
              },
            },
            {
              label: 'Traiter',
              iconId: 'fr-icon-check-line',
              nativeInputProps: { value: 'fix', onChange: handleActionChange },
            },
            {
              label: 'Rejeter',
              iconId: 'fr-icon-error-line',
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
  );
}
