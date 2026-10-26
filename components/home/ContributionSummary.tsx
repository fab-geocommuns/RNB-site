'use client';

import { useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import { Card } from '@codegouvfr/react-dsfr/Card';
import {
  SegmentedControl,
  SegmentedControlProps,
} from '@codegouvfr/react-dsfr/SegmentedControl';
import { Tag } from '@codegouvfr/react-dsfr/Tag';

import {
  ContributionSummary as ContributionSummaryData,
  DEFAULT_WINDOW,
  FigureView,
  formatNumber,
  keyFigures,
  RankingView,
  windowView,
} from '@/utils/contributionSummary';

const colors = fr.colors.decisions;

const EDITION_GUIDE_URL =
  'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb';

const LINKS = [
  { label: 'Comment est construit le RNB', href: '/a-propos' },
  { label: 'Le guide de l’édition', href: EDITION_GUIDE_URL },
  { label: 'Foire aux questions', href: '/faq' },
  { label: 'Toutes les statistiques', href: '/stats' },
];

// Key figure: the number and its label make one heading, so that the number
// is never read alone
function FigureCard({ figure }: { figure: FigureView }) {
  return (
    <Card
      border
      size="small"
      titleAs="h3"
      title={
        <>
          <span
            className={fr.cx('fr-display--xs', 'fr-mb-1w')}
            style={{
              display: 'block',
              color: colors.text.actionHigh.blueFrance.default,
            }}
          >
            {formatNumber(figure.value)}
          </span>
          <span className={fr.cx('fr-text--regular', 'fr-text--md')}>
            {figure.label}
          </span>
        </>
      }
      desc={
        figure.detail ? (
          <span
            className={fr.cx('fr-text--bold', 'fr-text--sm')}
            style={{ color: colors.text.default.success.default }}
          >
            {figure.detail}
          </span>
        ) : undefined
      }
    />
  );
}

function RankingCard({ ranking }: { ranking: RankingView }) {
  return (
    <Card
      border
      size="small"
      titleAs="h3"
      title={ranking.title}
      end={
        <ol className={fr.cx('fr-raw-list')}>
          {ranking.rows.map((row, i) => (
            <li
              key={`${row.name}-${i}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: fr.spacing('2w'),
                padding: `${fr.spacing('1w')} 0`,
                borderTop:
                  i > 0
                    ? `1px solid ${colors.border.default.grey.default}`
                    : undefined,
              }}
            >
              <span>
                {row.name}
                {row.detail && (
                  <span
                    className={fr.cx('fr-text--sm')}
                    style={{ color: colors.text.mention.grey.default }}
                  >
                    {' '}
                    · {row.detail}
                  </span>
                )}
              </span>
              <span className={fr.cx('fr-text--bold')}>
                {formatNumber(row.count)}
                <span className={fr.cx('fr-sr-only')}> contributions</span>
              </span>
            </li>
          ))}
        </ol>
      }
    />
  );
}

// « Participer au RNB » section of the home page. The key figures are global;
// below them, a selector picks the window (7 or 30 days) of the rankings and of
// the new contributors, with one summary per window. Renders nothing without
// data: the home page must not break when the API fails.
export default function ContributionSummary({
  summaries,
}: {
  summaries: ContributionSummaryData[] | null;
}) {
  const [selectedDays, setSelectedDays] = useState(DEFAULT_WINDOW);
  if (!summaries?.length) return null;

  const defaultSummary =
    summaries.find((s) => s.window_days === DEFAULT_WINDOW) ?? summaries[0];
  const summary =
    summaries.find((s) => s.window_days === selectedDays) ?? defaultSummary;
  const figures = keyFigures(defaultSummary);
  const { rankings, newcomers } = windowView(summary);
  const days = summary.window_days;
  // the DSFR expects a tuple of 1 to 5 segments; summaries is not empty here
  const segments = summaries.map((s) => ({
    label: `${s.window_days} derniers jours`,
    nativeInputProps: {
      value: s.window_days,
      checked: s.window_days === days,
      onChange: () => setSelectedDays(s.window_days),
    },
  })) as unknown as SegmentedControlProps['segments'];

  return (
    // colored band, like the other home page sections, so that the cards do
    // not merge with the white cards of the next section
    <section
      className={fr.cx('fr-my-8w')}
      style={{
        padding: `${fr.spacing('6w')} ${fr.spacing('3w')}`,
        backgroundColor: colors.background.alt.blueFrance.default,
      }}
    >
      <div className="section__titleblock">
        <h2 className="section__title">Participer au RNB</h2>
        <p className={fr.cx('fr-text--regular') + ' section__subtitle'}>
          Le RNB se construit en continu : avec les bases nationales, et avec
          celles et ceux qui connaissent leur territoire.
        </p>
      </div>

      {/* the tiles share the whole width, whatever their number */}
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {figures.map((figure) => (
          <div key={figure.label} className={fr.cx('fr-col-12', 'fr-col-md')}>
            <FigureCard figure={figure} />
          </div>
        ))}
      </div>

      <div
        className={fr.cx('fr-mt-4w', 'fr-mb-2w')}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: fr.spacing('2w'),
        }}
      >
        <h3 className={fr.cx('fr-h5', 'fr-mb-0')}>Ces {days} derniers jours</h3>
        {summaries.length > 1 && (
          <SegmentedControl legend="Période" hideLegend segments={segments} />
        )}
      </div>

      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {rankings.map((ranking) => (
          <div key={ranking.title} className={fr.cx('fr-col-12', 'fr-col-md')}>
            <RankingCard ranking={ranking} />
          </div>
        ))}
      </div>

      {newcomers.length > 0 && (
        <div className={fr.cx('fr-mt-5w')} style={{ textAlign: 'center' }}>
          <h3 className={fr.cx('fr-h6', 'fr-mb-1v')}>
            Nouveaux contributeurs ces {days} derniers jours
          </h3>
          <p className={fr.cx('fr-text--sm', 'fr-mb-2w')}>
            Leur toute première contribution : bienvenue !
          </p>
          <ul
            className={fr.cx('fr-tags-group')}
            style={{ justifyContent: 'center' }}
          >
            {newcomers.map((username) => (
              <li key={username}>
                <Tag iconId="fr-icon-user-line">{username}</Tag>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ButtonsGroup
        className={fr.cx('fr-mt-5w')}
        inlineLayoutWhen="md and up"
        alignment="center"
        buttons={[
          {
            children: 'S’inscrire pour contribuer',
            linkProps: { href: '/inscription' },
          },
        ]}
      />
      <ul
        className={fr.cx('fr-raw-list')}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: `${fr.spacing('1w')} ${fr.spacing('3w')}`,
        }}
      >
        {LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={fr.cx(
                'fr-link',
                'fr-link--sm',
                'fr-icon-arrow-right-line',
                'fr-link--icon-right',
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
