// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useEffect, useRef, useState } from 'react';

import genericStyles from '@/styles/genericPanel.module.scss';
import panelStyles from '@/styles/panel.module.scss';
import filterStyles from '@/styles/report/reportFilters.module.scss';

import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
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

type ReportCount = { count: number; status: 'ouvert' | 'clôturé' };

const pluralize = ({ count, word }: { count: number; word: string }) =>
  count > 1 ? `${word}s` : word;

const reportLabel = ({ count, status }: ReportCount) =>
  `${pluralize({ count, word: 'signalement' })} ${pluralize({ count, word: status })}`;

const statusCountLabel = ({ count, status }: ReportCount) =>
  `${count} ${pluralize({ count, word: status })}`;

const openCount = (tag: TagStat) =>
  tag.total_report_count - tag.closed_report_count;

const tagHint = ({
  tag,
  showClosedReports,
}: {
  tag: TagStat;
  showClosedReports: boolean;
}) => {
  const open = openCount(tag);
  return showClosedReports
    ? `${statusCountLabel({ count: open, status: 'ouvert' })} · ${statusCountLabel({ count: tag.closed_report_count, status: 'clôturé' })}`
    : `${open} ${reportLabel({ count: open, status: 'ouvert' })}`;
};

// A report with several tags is counted once per tag: an exact count would need a tag filter on the stats API
const sumOpenCounts = (tagStats: TagStat[]) =>
  tagStats.reduce((sum, tag) => sum + openCount(tag), 0);

export default function ReportFilters({ isOpen }: { isOpen?: boolean }) {
  const dispatch = useDispatch<AppDispatch>();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isGlowing, setIsGlowing] = useState(false);
  const prevClosedCountRef = useRef<number | null>(null);

  const lastReportUpdate = useSelector(
    (state: any) => state.report.lastReportUpdate,
  );
  const displayedTags = useSelector((state: any) => state.report.displayedTags);
  const showClosedReports = useSelector(
    (state: RootState) => state.report.showClosedReports,
  );

  // We update the stats every 5 seconds or when a report has been closed (lastReportUpdate)
  // If the stats have changed, we make the indicator glow
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let cancelled = false;

    async function fetchStats() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/reports/stats/`,
        );
        if (!response.ok) {
          throw new Error('Failed to fetch report stats');
        }

        const data = await response.json();
        if (cancelled) return;
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

    return () => {
      cancelled = true;
      clearTimeout(intervalId);
    };
  }, [lastReportUpdate]);

  const isTagSelected = (tagId: number) => {
    if (displayedTags === 'all') return true;
    return displayedTags.includes(tagId);
  };

  const selectedOpenCount = !stats
    ? 0
    : displayedTags === 'all'
      ? stats.total_report_count - stats.closed_report_count
      : sumOpenCounts(
          stats.tag_stats.filter((tag) => isTagSelected(tag.tag_id)),
        );

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
                {selectedOpenCount}
              </span>{' '}
              <span className={filterStyles.totalLabel}>
                {reportLabel({ count: selectedOpenCount, status: 'ouvert' })}
              </span>
            </div>

            <div className={filterStyles.infoText}>
              Les signalements sont des indices permettant aux contributeurs
              d&apos;améliorer le RNB.
            </div>
          </div>
          <div className={panelStyles.section}>
            <ToggleSwitch
              label="Afficher les clôturés"
              showCheckedHint={false}
              checked={showClosedReports}
              onChange={(checked) =>
                dispatch(Actions.report.setShowClosedReports(checked))
              }
            />
          </div>
          <div className={genericStyles.section}>
            <Checkbox
              legend="Filtrer les signalements"
              classes={{ legend: filterStyles.subtitle }}
              small
              options={stats.tag_stats.map((tag) => ({
                label: tag.tag_name,
                hintText: tagHint({ tag, showClosedReports }),
                nativeInputProps: {
                  name: `tag-${tag.tag_id}`,
                  checked: isTagSelected(tag.tag_id),
                  onChange: () => handleTagToggle(tag.tag_id),
                },
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
