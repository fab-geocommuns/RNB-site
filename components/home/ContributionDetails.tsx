'use client';

import { useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { TagsGroup, TagsGroupProps } from '@codegouvfr/react-dsfr/TagsGroup';

import {
  FigureCards,
  PeriodSelector,
  RankingCard,
} from '@/components/home/ContributionSummary';
import {
  ContributionSummary as ContributionSummaryData,
  keyFigures,
  Period,
  periodOf,
  summaryOf,
  windowView,
} from '@/utils/contributionSummary';

// Details of the « Participer au RNB » section: every figure of the period,
// the rankings and the newcomers. Same summaries, same period selector; the
// period is kept in the URL, so that the page can be shared as it is seen.
export default function ContributionDetails({
  summaries,
  initialPeriod,
}: {
  summaries: ContributionSummaryData[];
  initialPeriod: Period;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const summary = summaryOf(summaries, selectedPeriod);
  const period = periodOf(summary);
  const { contributions, organizations, cities } = keyFigures(summary);
  const { rankings, newcomersTitle, newcomers } = windowView(summary);

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

      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-1w')}>
        {rankings.map((ranking) => (
          <div key={ranking.title} className={fr.cx('fr-col-12', 'fr-col-md')}>
            <RankingCard ranking={ranking} titleAs="h2" />
          </div>
        ))}
      </div>

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
