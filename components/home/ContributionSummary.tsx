'use client';

import { useState } from 'react';
import Link from 'next/link';
import { fr } from '@codegouvfr/react-dsfr';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import { Card } from '@codegouvfr/react-dsfr/Card';
import {
  SegmentedControl,
  SegmentedControlProps,
} from '@codegouvfr/react-dsfr/SegmentedControl';

import { OrganizationName } from '@/components/OrganizationName';
import {
  ContributionSummary as ContributionSummaryData,
  DEFAULT_PERIOD,
  FigureView,
  formatNumber,
  keyFigures,
  Period,
  periodLabel,
  periodOf,
  RankingView,
  summaryOf,
} from '@/utils/contributionSummary';

const colors = fr.colors.decisions;

const EDITION_GUIDE_URL =
  'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb';

const LINKS = [
  {
    label: 'Comment est construit le RNB',
    href: '/a-propos#sources-et-mise-a-jour',
  },
  { label: 'Guide de l’édition', href: EDITION_GUIDE_URL },
  { label: 'Foire aux questions', href: '/faq' },
  { label: 'Toutes les statistiques', href: '/stats' },
];

// Key figure: the number and its label make one heading, so that the number
// is never read alone
export function FigureCard({
  figure,
  titleAs = 'h3',
}: {
  figure: FigureView;
  titleAs?: 'h2' | 'h3';
}) {
  return (
    <Card
      border
      size="small"
      titleAs={titleAs}
      // the empty end block would add a blank space under the figure; the
      // detail stays close to the label it qualifies
      classes={{ end: fr.cx('fr-hidden'), desc: fr.cx('fr-mt-0') }}
      title={
        <>
          <span
            className={fr.cx('fr-display--xs', 'fr-mb-0')}
            style={{
              display: 'block',
              color: colors.text.actionHigh.blueFrance.default,
            }}
          >
            {formatNumber(figure.value)}
          </span>
          {/* block, so that its own line height applies instead of the
              heading's */}
          <span
            className={fr.cx('fr-text--regular', 'fr-text--md', 'fr-mb-0')}
            style={{ display: 'block' }}
          >
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

export function RankingCard({
  ranking,
  titleAs = 'h3',
}: {
  ranking: RankingView;
  titleAs?: 'h2' | 'h3';
}) {
  return (
    <Card
      border
      size="small"
      titleAs={titleAs}
      title={ranking.title}
      end={
        <ol className={fr.cx('fr-raw-list')}>
          {ranking.rows.map((row, i) => (
            <li
              key={`${row.name.name}-${i}`}
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
              {/* a long name without spaces (a username) is cut, rather than
                  widening its column */}
              <span style={{ overflowWrap: 'anywhere' }}>
                <OrganizationName {...row.name} />
                {row.detail && (
                  <span
                    className={fr.cx('fr-text--sm')}
                    style={{ color: colors.text.mention.grey.default }}
                  >
                    {' '}
                    · <OrganizationName {...row.detail} />
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

// Selector of the period shown, one segment per summary; nothing with a
// single summary
export function PeriodSelector({
  summaries,
  period,
  onChange,
}: {
  summaries: ContributionSummaryData[];
  period: Period;
  onChange: (period: Period) => void;
}) {
  if (summaries.length < 2) return null;
  // the DSFR expects a tuple of 1 to 5 segments
  const segments = summaries.map((s) => ({
    label: periodLabel(periodOf(s)),
    nativeInputProps: {
      value: String(periodOf(s)),
      checked: periodOf(s) === period,
      onChange: () => onChange(periodOf(s)),
    },
  })) as unknown as SegmentedControlProps['segments'];
  return (
    <div className={fr.cx('fr-mt-5w', 'fr-mb-3w')}>
      {/* white, so that it stands out on the colored band */}
      <SegmentedControl
        legend="Période"
        hideLegend
        segments={segments}
        style={{
          backgroundColor: colors.background.default.grey.default,
        }}
      />
    </div>
  );
}

// Key figures side by side, sharing the whole width whatever their number
export function FigureCards({
  figures,
  titleAs,
}: {
  figures: FigureView[];
  titleAs?: 'h2' | 'h3';
}) {
  return (
    <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
      {figures.map((figure) => (
        <div key={figure.label} className={fr.cx('fr-col-12', 'fr-col-md')}>
          <FigureCard figure={figure} titleAs={titleAs} />
        </div>
      ))}
    </div>
  );
}

// Page of the rankings, cities and newcomers, opened on the selected period
export const detailsHref = (period: Period) =>
  `/apercu-activite/details?periode=${period}`;

// « Participer au RNB » section of the home page: the number of contributions
// and of contributing organizations. A selector picks the period (the last 7
// or 30 days, or the whole period), one summary
// per period; the rest of the summary is on the details page. Renders nothing
// without data: the home page must not break when the API fails.
export default function ContributionSummary({
  summaries,
}: {
  summaries: ContributionSummaryData[] | null;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);
  if (!summaries?.length) return null;

  const summary = summaryOf(summaries, selectedPeriod);
  const period = periodOf(summary);
  const { contributions, organizations } = keyFigures(summary);

  return (
    // colored band, like the other home page sections, so that the cards do
    // not merge with the white cards of the next section
    <section
      className={fr.cx('fr-my-8w', 'fr-py-6w', 'fr-px-3w', 'fr-px-md-5w')}
      style={{
        backgroundColor: colors.background.alt.blueFrance.default,
      }}
    >
      {/* left-aligned, unlike the other home page sections */}
      <h2
        className={fr.cx('fr-mb-2w') + ' section__title'}
        style={{ textAlign: 'left' }}
      >
        Participer au RNB
      </h2>
      <p
        className={fr.cx('fr-text--regular', 'fr-mb-2w') + ' section__subtitle'}
        style={{ textAlign: 'left' }}
      >
        Le RNB est construit en continu grâce aux imports de la BD Topo et de la
        BAN ainsi qu’aux contributions de ceux ayant une connaissance fine de
        leur territoire.
      </p>
      {/* right under the introduction: the section raises questions for a
          visitor who discovers the collaborative edition */}
      <ul
        className={fr.cx('fr-raw-list')}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: `${fr.spacing('1w')} ${fr.spacing('3w')}`,
        }}
      >
        {LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href} className={fr.cx('fr-link', 'fr-link--sm')}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <PeriodSelector
        summaries={summaries}
        period={period}
        onChange={setSelectedPeriod}
      />

      <FigureCards figures={[contributions, organizations]} />

      <p className={fr.cx('fr-mt-3w', 'fr-mb-0')}>
        <Link
          href={detailsHref(period)}
          className={fr.cx(
            'fr-link',
            'fr-icon-arrow-right-line',
            'fr-link--icon-right',
          )}
        >
          Voir le détail de l’activité
        </Link>
      </p>

      <ButtonsGroup
        className={fr.cx('fr-mt-5w')}
        inlineLayoutWhen="md and up"
        buttons={[
          {
            children: 'S’inscrire pour contribuer',
            linkProps: { href: '/inscription' },
          },
        ]}
      />
    </section>
  );
}
