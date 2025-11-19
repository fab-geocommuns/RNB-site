// Store
import { useDispatch, useSelector } from 'react-redux';
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
  const lastReportUpdate = useSelector(
    (state: any) => state.report.lastReportUpdate,
  );
  const displayedTags = useSelector((state: any) => state.report.displayedTags);

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
  }, [isOpen, lastReportUpdate]);

  const getProgressBarWidth = () => {
    if (!stats || stats.total_report_count === 0) return '0%';
    return `${(stats.closed_report_count / stats.total_report_count) * 100}%`;
  };

  const isTagSelected = (tagId: number) => {
    if (displayedTags === 'all') return true;
    return displayedTags.includes(tagId);
  };

  const handleTagToggle = (tagId: number) => {
    if (!stats) return;

    const allTagIds = stats.tag_stats.map((t) => t.tag_id);
    let newTags: number[] = [];

    if (displayedTags === 'all') {
      // If currently 'all', unchecking one means we select all others
      newTags = allTagIds.filter((id) => id !== tagId);
    } else {
      if (displayedTags.includes(tagId)) {
        // Uncheck
        newTags = displayedTags.filter((id: number) => id !== tagId);
      } else {
        // Check
        newTags = [...displayedTags, tagId];
      }
    }

    dispatch(Actions.report.setDisplayedTags(newTags));
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
                    <div className="fr-checkbox-group fr-checkbox-group--sm">
                      <input
                        type="checkbox"
                        id={`tag-${tag.tag_id}`}
                        name={`tag-${tag.tag_id}`}
                        checked={isTagSelected(tag.tag_id)}
                        onChange={() => handleTagToggle(tag.tag_id)}
                      />
                      <label
                        className="fr-label"
                        htmlFor={`tag-${tag.tag_id}`}
                        style={{ width: '100%' }}
                      >
                        <span className={filterStyles.tagName}>
                          {tag.tag_name}
                        </span>
                        <span
                          className={filterStyles.tagCount}
                          style={{ float: 'right' }}
                        >
                          {openCount} ouverts
                        </span>
                      </label>
                    </div>
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
