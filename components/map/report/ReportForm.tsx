import styles from '@/styles/report/form.module.scss';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';

export default function ReportForm({ report }: { report?: any }) {
  if (report.properties.status != 'pending') {
    return null;
  }

  return (
    <div className={styles.shell}>
      <form method="post" action="/api/report/respond">
        <input type="hidden" name="reportId" value={report.id} />
        <div>
          <label htmlFor="message">Votre message</label>
          <textarea
            className="fr-input"
            id="message"
            name="message"
            required
          ></textarea>
        </div>
        <SegmentedControl
          small={true}
          name="action"
          legend="Votre action"
          segments={[
            {
              label: 'Commenter',
            },
            {
              label: 'Traiter',
            },
            {
              label: 'Rejeter',
            },
          ]}
        />
        <div>
          <button type="submit">Envoyer</button>
        </div>
      </form>
    </div>
  );
}
