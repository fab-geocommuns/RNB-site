import { useSelector } from 'react-redux';

import styles from '@/styles/genericPanel.module.scss';

import ReportFilters from './ReportFilters';
import ReportDetails from './ReportDetails';
import { RootState } from '@/stores/store';

export default function ReportPanels({
  mapPanelOpen,
  belowEditionActions = false,
}: {
  // On mobile, hides behind the page's own panel (building, edition) when that one was opened last
  mapPanelOpen: boolean;
  belowEditionActions?: boolean;
}) {
  const filtersDrawerOpen = useSelector(
    (state: RootState) => state.report.filtersDrawerOpen,
  );
  const selectedReport = useSelector(
    (state: RootState) => state.report.selectedReport,
  );
  const reportPanelInFront = useSelector(
    (state: RootState) => state.report.reportPanelInFront,
  );
  const layersSwitcherOpen = useSelector(
    (state: RootState) => state.map.layersSwitcherOpen,
  );

  if (layersSwitcherOpen) return null;

  const className = [
    styles.reportShell,
    belowEditionActions && styles.reportShellBelowEditionActions,
    mapPanelOpen && !reportPanelInFront && styles.reportShellHiddenOnMobile,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <ReportFilters isOpen={filtersDrawerOpen} />
      {selectedReport && (
        <ReportDetails key={selectedReport.id} report={selectedReport} />
      )}
    </div>
  );
}
