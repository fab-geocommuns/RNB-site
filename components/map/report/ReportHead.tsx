import styles from '@/styles/report/reportHead.module.scss';

import ReportMessage from '@/components/map/report/ReportMessage';

export default function ReportHead({ report }: { report: any }) {
  const hasAnswers = report.properties.messages.length > 1;

  return (
    <div className={`${styles.head} ${hasAnswers ? styles.withAnswers : ''}`}>
      <ReportMessage
        message={report.properties.messages[0]}
        status={report.properties.status}
      />
    </div>
  );
}
