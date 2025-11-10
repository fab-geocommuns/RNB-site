import styles from '@/styles/report/form.module.scss';

export default function ReportForm({ report }: { report?: any }) {
  if (report.properties.status != 'pending') {
    return null;
  }

  return <div className={styles.shell}>FORM</div>;
}
