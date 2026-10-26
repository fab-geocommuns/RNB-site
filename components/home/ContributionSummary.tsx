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
  PodiumView,
  RankingView,
  SentencePart,
  SummaryVariant,
  summaryView,
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

// "recit" layout: a sentence whose numbers stand out (bold, blue) while the
// words stay in regular weight (fr-h3 forces bold on the heading itself)
function Story({ parts }: { parts: SentencePart[] }) {
  return (
    <h3 className={fr.cx('fr-h3')} style={{ textAlign: 'center' }}>
      {parts.map((part, i) =>
        part.isNumber ? (
          <strong
            key={i}
            style={{ color: colors.text.actionHigh.blueFrance.default }}
          >
            {part.text}
          </strong>
        ) : (
          <span key={i} className={fr.cx('fr-text--regular')}>
            {part.text}
          </span>
        ),
      )}
    </h3>
  );
}

// "recit" layout: the first of each ranking
function PodiumCard({ item }: { item: PodiumView }) {
  return (
    <Card
      border
      size="small"
      titleAs="h4"
      detail={item.title}
      title={item.name}
      desc={
        <>
          <span
            className={fr.cx('fr-text--bold')}
            style={{ color: colors.text.actionHigh.blueFrance.default }}
          >
            {formatNumber(item.count)}{' '}
            {item.count > 1 ? 'contributions' : 'contribution'}
          </span>
          {item.detail && <> · {item.detail}</>}
        </>
      }
    />
  );
}

// The tiles share the whole width, whatever their number
function Figures({ figures }: { figures: FigureView[] }) {
  return (
    <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
      {figures.map((figure) => (
        <div key={figure.label} className={fr.cx('fr-col-12', 'fr-col-md')}>
          <FigureCard figure={figure} />
        </div>
      ))}
    </div>
  );
}

function Rankings({ rankings }: { rankings: RankingView[] }) {
  return (
    <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-1w')}>
      {rankings.map((ranking) => (
        <div key={ranking.title} className={fr.cx('fr-col-12', 'fr-col-md')}>
          <RankingCard ranking={ranking} />
        </div>
      ))}
    </div>
  );
}

// "Ces 30 derniers jours": tells which window the figures below are about
function PeriodHeading({ days }: { days: number }) {
  return (
    <h3 className={fr.cx('fr-h5', 'fr-mt-4w', 'fr-mb-2w')}>
      Ces {days} derniers jours
    </h3>
  );
}

// « Participer au RNB » section of the home page, with one summary per window
// (7 and 30 days) and a selector between them. Renders nothing without data:
// the home page must not break when the API fails.
export default function ContributionSummary({
  summaries,
  variant = 'simple',
}: {
  summaries: ContributionSummaryData[] | null;
  variant?: SummaryVariant;
}) {
  const [selectedDays, setSelectedDays] = useState(DEFAULT_WINDOW);
  if (!summaries?.length) return null;
  const summary =
    summaries.find((s) => s.window_days === selectedDays) ?? summaries[0];
  const { rankings, newcomers, story, podium, ...view } = summaryView(
    summary,
    variant,
  );
  const days = summary.window_days;
  // "simple": the key figures are global (cumulative counts, and their
  // evolution over 30 days), they do not follow the selected window
  const figures =
    variant === 'simple'
      ? summaryView(
          summaries.find((s) => s.window_days === DEFAULT_WINDOW) ??
            summaries[0],
          variant,
        ).figures
      : view.figures;
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

      {/* the selector drives what it is above of */}
      {variant !== 'simple' && summaries.length > 1 && (
        <div
          className={fr.cx('fr-mb-4w')}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <SegmentedControl legend="Période" hideLegend segments={segments} />
        </div>
      )}

      {variant === 'recit' ? (
        <>
          <Story parts={story} />
          {podium.length > 0 && (
            <div
              className={fr.cx(
                'fr-grid-row',
                'fr-grid-row--gutters',
                'fr-mt-3w',
              )}
            >
              {podium.map((item) => (
                <div
                  key={item.title}
                  className={fr.cx('fr-col-12', 'fr-col-md')}
                >
                  <PodiumCard item={item} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* "complet": every figure is about the window */}
          {variant === 'complet' && <PeriodHeading days={days} />}
          <Figures figures={figures} />
          {/* "simple": the window, and its selector, only from here on */}
          {variant === 'simple' && (
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
              <h3 className={fr.cx('fr-h5', 'fr-mb-0')}>
                Ces {days} derniers jours
              </h3>
              {summaries.length > 1 && (
                <SegmentedControl
                  legend="Période"
                  hideLegend
                  segments={segments}
                />
              )}
            </div>
          )}
          <Rankings rankings={rankings} />
        </>
      )}

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
