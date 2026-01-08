// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import { useEffect, useRef, useState } from 'react';

import genericStyles from '@/styles/genericPanel.module.scss';
import panelStyles from '@/styles/panel.module.scss';
import filterStyles from '@/styles/report/reportFilters.module.scss';

import Tooltip from '@codegouvfr/react-dsfr/Tooltip';

import reportIcon from '@/public/images/map/report.png';
import Image from 'next/image';

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
  const dispatch = useDispatch<AppDispatch>();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isGlowing, setIsGlowing] = useState(false);
  const prevClosedCountRef = useRef<number | null>(null);

  const lastReportUpdate = useSelector(
    (state: any) => state.report.lastReportUpdate,
  );
  const displayedTags = useSelector((state: any) => state.report.displayedTags);

  // We update the stats every 5 seconds or when a report has been closed (lastReportUpdate)
  // If the stats have changed, we make the indicator glow
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchStats() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/reports/stats/`,
        );
        if (!response.ok) {
          throw new Error('Failed to fetch report stats');
        }

        const data = await response.json();
        setStats(data);

        if (prevClosedCountRef.current !== null) {
          if (data.closed_report_count !== prevClosedCountRef.current) {
            setIsGlowing(true);
            setTimeout(() => setIsGlowing(false), 3000);
          }
        }
        prevClosedCountRef.current = data.closed_report_count;

        intervalId = setTimeout(fetchStats, 5000);
      } catch (error) {
        console.error('Failed to fetch report stats:', error);
      }
    }

    fetchStats();

    return () => clearTimeout(intervalId);
  }, [lastReportUpdate]);

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
    <div
      className={`${genericStyles.container} ${filterStyles.shell} ${isOpen ? filterStyles.open : ''}`}
    >
      <div
        className={`${genericStyles.head} ${filterStyles.head}`}
        onClick={() => dispatch(Actions.report.toggleFiltersDrawer())}
      >
        <div className={filterStyles.titleShell}>
          <Image
            src={reportIcon}
            alt="Suivi des signalements"
            className={filterStyles.headIcon}
          />
          <h2
            className={`${genericStyles.subtitle} ${filterStyles.headSubtitle}`}
          >
            Suivi des signalements
          </h2>
          <div>
            <Tooltip
              className={filterStyles.activityTooltip}
              kind="hover"
              title="Suivi des signalements : s'allume quand vous ou un autre utilisateur ferme un signalement"
            >
              <div
                className={`${filterStyles.activityIndicator} ${
                  isGlowing ? filterStyles.active : ''
                }`}
              />
            </Tooltip>
          </div>
        </div>
        <a href="#" className={genericStyles.closeLink}>
          <i
            className={[
              'fr-icon-arrow-down-s-line',
              genericStyles.closeLinkIcon,
              isOpen ? genericStyles.closeLinkIconOpen : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </a>
      </div>

      {isOpen && stats && (
        <div className={genericStyles.body}>
          <div className={panelStyles.section}>
            <div className={filterStyles.totalShell}>
              <span className={filterStyles.totalCount}>
                {stats.total_report_count - stats.closed_report_count}
              </span>{' '}
              <span className={filterStyles.totalLabel}>
                signalements ouverts
              </span>
            </div>

            <div className={filterStyles.infoText}>
              Les signalements sont des indices permettant aux contributeurs
              d&apos;améliorer le RNB.
            </div>
          </div>
          <div className={genericStyles.section}>
            <div className={filterStyles.subtitle}>
              Filtrer les signalements
            </div>

            <div className={`fr-checkbox-group fr-checkbox-group--sm`}>
              {stats.tag_stats.map((tag) => {
                const openCount =
                  tag.total_report_count - tag.closed_report_count;
                return (
                  <div key={tag.tag_id} className={filterStyles.tagItem}>
                    <div>
                      <input
                        type="checkbox"
                        id={`tag-${tag.tag_id}`}
                        name={`tag-${tag.tag_id}`}
                        checked={isTagSelected(tag.tag_id)}
                        onChange={() => {
                          handleTagToggle(tag.tag_id);
                        }}
                      />
                      <label
                        className={filterStyles.tagLabel}
                        htmlFor={`tag-${tag.tag_id}`}
                      >
                        <div>
                          <div className={filterStyles.tagName}>
                            {tag.tag_name}
                          </div>
                          <div className={filterStyles.tagCount}>
                            {openCount} signalement{openCount > 1 ? 's' : ''}{' '}
                            ouvert{openCount > 1 ? 's' : ''}
                          </div>
                        </div>
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
