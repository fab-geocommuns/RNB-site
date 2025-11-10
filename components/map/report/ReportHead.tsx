import ReportMessage from '@/components/map/report/ReportMessage';
import ReportStatus from '@/components/map/report/ReportStatus';

export default function ReportHead({ report }: { report: any }) {
  return (
    <>
      <ReportStatus status={report.properties.status} />
      <ReportMessage message={report.properties.messages[0]} />
    </>
  );
}
