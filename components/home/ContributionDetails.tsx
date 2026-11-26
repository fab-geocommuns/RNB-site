'use client';

import { useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { Table } from '@codegouvfr/react-dsfr/Table';
import { Tabs } from '@codegouvfr/react-dsfr/Tabs';
import { TagsGroup, TagsGroupProps } from '@codegouvfr/react-dsfr/TagsGroup';

import { OrganizationName } from '@/components/OrganizationName';
import {
  FigureCards,
  PeriodSelector,
  RankingCard,
} from '@/components/home/ContributionSummary';
import {
  ContributionRankings,
  ContributionSummary as ContributionSummaryData,
  formatNumber,
  fullRankingViews,
  keyFigures,
  Period,
  periodOf,
  RankingView,
  rankingsOf,
  summaryOf,
  windowView,
} from '@/utils/contributionSummary';

// A full ranking: hundreds of rows, hence a table rather than a card
function RankingTable({ ranking }: { ranking: RankingView }) {
  const headers = [
    'Rang',
    ranking.nameHeader,
    ...(ranking.detailHeader ? [ranking.detailHeader] : []),
    'Contributions',
  ];
  const data = ranking.rows.map((row, i) => [
    i + 1,
    // a long name without spaces (a username) is cut, rather than widening
    // its column
    <span key="name" style={{ overflowWrap: 'anywhere' }}>
      <OrganizationName {...row.name} />
    </span>,
    ...(ranking.detailHeader
      ? [row.detail ? <OrganizationName key="detail" {...row.detail} /> : '–']
      : []),
    formatNumber(row.count),
  ]);
  return (
    <Table
      caption={ranking.title}
      headers={headers}
      data={data}
      bordered
      className={fr.cx('fr-mb-0')}
    />
  );
}

// The full rankings, one tab each
function RankingTabs({ rankings }: { rankings: RankingView[] }) {
  const [selected, setSelected] = useState(rankings[0]?.shortTitle);
  if (!rankings.length) return null;
  // a ranking may have no row in another period
  const current =
    rankings.find((r) => r.shortTitle === selected) ?? rankings[0];
  return (
    <Tabs
      label="Classements"
      selectedTabId={current.shortTitle}
      onTabChange={setSelected}
      tabs={rankings.map((r) => ({
        tabId: r.shortTitle,
        label: `${r.shortTitle} (${formatNumber(r.rows.length)})`,
      }))}
    >
      <RankingTable ranking={current} />
    </Tabs>
  );
}

// Details of the « Participer au RNB » section: every figure of the period,
// the full rankings and the newcomers. Same summaries, same period selector;
// the period is kept in the URL, so that the page can be shared as it is
// seen. Without the full rankings (the API failed), the first rows of the
// summary.
export default function ContributionDetails({
  summaries,
  rankings,
  initialPeriod,
}: {
  summaries: ContributionSummaryData[];
  rankings: ContributionRankings[] | null;
  initialPeriod: Period;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const summary = summaryOf(summaries, selectedPeriod);
  const period = periodOf(summary);
  const { contributions, organizations, cities } = keyFigures(summary);
  const {
    rankings: topRankings,
    newcomersTitle,
    newcomers,
  } = windowView(summary);
  const fullRankings = rankingsOf(rankings, period);

  const selectPeriod = (p: Period) => {
    setSelectedPeriod(p);
    // no navigation: the page already has every period
    window.history.replaceState(null, '', `?periode=${p}`);
  };

  return (
    <>
      <PeriodSelector
        summaries={summaries}
        period={period}
        onChange={selectPeriod}
      />

      <FigureCards
        figures={[contributions, organizations, cities]}
        titleAs="h2"
      />

      {fullRankings ? (
        <div className={fr.cx('fr-mt-5w')}>
          <h2 className={fr.cx('fr-h4')}>Classements</h2>
          <RankingTabs rankings={fullRankingViews(fullRankings)} />
        </div>
      ) : (
        <div
          className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-1w')}
        >
          {topRankings.map((ranking) => (
            <div
              key={ranking.title}
              className={fr.cx('fr-col-12', 'fr-col-md')}
            >
              <RankingCard ranking={ranking} titleAs="h2" />
            </div>
          ))}
        </div>
      )}

      {newcomers.length > 0 && (
        <div className={fr.cx('fr-mt-5w')}>
          <h2 className={fr.cx('fr-h6', 'fr-mb-1v')}>{newcomersTitle}</h2>
          <p className={fr.cx('fr-text--sm', 'fr-mb-2w')}>
            Leur toute première contribution : bienvenue !
          </p>
          {/* keyed by position: two usernames can be the same once the
              emails are cut before the @ */}
          <TagsGroup
            tags={
              newcomers.map((username) => ({
                children: username,
                iconId: 'fr-icon-user-line',
              })) as TagsGroupProps['tags']
            }
          />
        </div>
      )}
    </>
  );
}
