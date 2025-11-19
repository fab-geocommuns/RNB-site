// Store
import { useDispatch } from 'react-redux';
import { Actions } from '@/stores/store';
import { useEffect, useState } from 'react';

import panelStyles from '@/styles/genericPanel.module.scss';
import filterStyles from '@/styles/report/reportFilters.module.scss';

interface TagStat {
  tag_id: number;
  tag_slug: string;
  tag_name: string;
  total_report_count: number;
  closed_report_count: number;
}

interface ReportStats {
  closed_report_count: number;
  total_report_count: number;
  tag_stats: TagStat[];
}

export default function ReportFilters({ isOpen }: { isOpen?: boolean }) {
  const dispatch = useDispatch();
  const [stats, setStats] = useState<ReportStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/reports/stats/`,
        );
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch report stats:', error);
      }
    }

    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const getProgressBarWidth = () => {
    if (!stats || stats.total_report_count === 0) return '0%';
    return `${(stats.closed_report_count / stats.total_report_count) * 100}%`;
  };

  return (
    <div className={`${panelStyles.container} ${filterStyles.shell}`}>
      <div
        className={panelStyles.head}
        onClick={() => dispatch(Actions.report.toggleFiltersDrawer())}
      >
        <div>
          <h2 className={panelStyles.subtitle}>Suivi des signalements</h2>
        </div>
        <a href="#" className={panelStyles.closeLink}>
          <i
            className={[
              'fr-icon-arrow-down-s-line',
              panelStyles.closeLinkIcon,
              isOpen ? panelStyles.closeLinkIconOpen : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </a>
      </div>
      {isOpen && stats && (
        <div className={panelStyles.body}>
          <div className={filterStyles.statsContainer}>
            <div className={filterStyles.progressSection}>
              <div className={filterStyles.progressLabel}>
                <span>Avancement global</span>
                <span>
                  {stats.closed_report_count} / {stats.total_report_count}
                </span>
              </div>
              <div className={filterStyles.progressBarContainer}>
                <div
                  className={filterStyles.progressBarFill}
                  style={{ width: getProgressBarWidth() }}
                />
              </div>
            </div>

            <div className={filterStyles.tagsList}>
              {stats.tag_stats.map((tag) => {
                const openCount =
                  tag.total_report_count - tag.closed_report_count;
                return (
                  <div key={tag.tag_id} className={filterStyles.tagItem}>
                    <span className={filterStyles.tagName}>{tag.tag_name}</span>
                    <span className={filterStyles.tagCount}>
                      {openCount} ouverts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
