'use client';

import { useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import { Card } from '@codegouvfr/react-dsfr/Card';
import {
  SegmentedControl,
  SegmentedControlProps,
} from '@codegouvfr/react-dsfr/SegmentedControl';
import { Tabs } from '@codegouvfr/react-dsfr/Tabs';
import { Tag } from '@codegouvfr/react-dsfr/Tag';

import {
  ACTIVITY_PERIODS,
  activityHeadline,
  DEFAULT_PERIOD_KEY,
  EditionActivity as EditionActivityData,
  editionsTrend,
} from '@/utils/editionActivity';

type Props = {
  activities: EditionActivityData[];
};

const formatNumber = (n: number) => n.toLocaleString('fr-FR');

const colors = fr.colors.decisions;

const plural = (n: number, singular: string, pluralForm: string) =>
  `${formatNumber(n)} ${n > 1 ? pluralForm : singular}`;

// Key figure: a small label, the number as the card title, one line of detail
function FigureCard({
  label,
  value,
  desc,
}: {
  label: string;
  value: number;
  desc?: string | null;
}) {
  return (
    <Card
      border
      size="small"
      titleAs="h3"
      classes={{ title: fr.cx('fr-display--xs') }}
      detail={label}
      title={formatNumber(value)}
      desc={desc ?? undefined}
    />
  );
}

// "+18 % par rapport aux 30 jours précédents"
function trendText(activity: EditionActivityData): string | null {
  const trend = editionsTrend(activity);
  if (trend === null) return null;
  const period = ACTIVITY_PERIODS.find((p) => p.key === activity.period.key);
  const reference = period
    ? `aux ${period.label} précédents`
    : 'à la période précédente';
  return `${trend > 0 ? '+' : ''}${trend} % par rapport ${reference}`;
}

type RankingRow = { name: string; detail: string | null; count: number };

// The single list layout used by every ranking of the block
function RankingList({ rows }: { rows: RankingRow[] }) {
  if (rows.length === 0) {
    return <p className={fr.cx('fr-mb-0')}>Aucune donnée sur cette période.</p>;
  }
  return (
    <ol className={fr.cx('fr-raw-list')}>
      {rows.map((row, i) => (
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
          </span>
        </li>
      ))}
    </ol>
  );
}

type RankingKey = 'users' | 'organizations' | 'cities' | 'departments';

const RANKINGS: { key: RankingKey; label: string }[] = [
  { key: 'users', label: 'Contributeurs' },
  { key: 'organizations', label: 'Organisations' },
  { key: 'cities', label: 'Communes' },
  { key: 'departments', label: 'Départements' },
];

function rankingRows(
  activity: EditionActivityData,
  key: RankingKey,
): RankingRow[] {
  if (key === 'users') {
    return activity.top.users.map((u) => ({
      name: u.username,
      detail: u.organization_short_name,
      count: u.count,
    }));
  }
  if (key === 'organizations') {
    return activity.top.organizations.map((o) => ({
      name: o.short_name || o.name,
      detail: o.short_name ? o.name : null,
      count: o.count,
    }));
  }
  if (key === 'cities') {
    return activity.top.cities.map((c) => ({
      name: c.name,
      detail: c.department?.code ?? null,
      count: c.count,
    }));
  }
  return activity.top.departments.map((d) => ({
    name: d.name,
    detail: d.code,
    count: d.count,
  }));
}

// Every ranking in one DSFR tabs component, the same list in each tab
function Rankings({ activity }: { activity: EditionActivityData }) {
  return (
    <>
      <h3 className={fr.cx('fr-h5', 'fr-mt-4w')}>Les plus actifs</h3>
      <Tabs
        label="Les plus actifs"
        // white panel, like the cards, on the colored band
        classes={{
          panel: fr.cx('fr-p-3w'),
        }}
        style={{ backgroundColor: colors.background.default.grey.default }}
        tabs={RANKINGS.map((r) => ({
          label: r.label,
          content: <RankingList rows={rankingRows(activity, r.key)} />,
        }))}
      />
    </>
  );
}

// One line of tags: departments, cities and users who contributed for the first time
function Newcomers({ activity }: { activity: EditionActivityData }) {
  const { users, cities, departments } = activity.newcomers;
  const tags = [
    ...departments.map((d) => `${d.name} (${d.code})`),
    ...cities.map((c) => c.name),
    ...users.map((u) => u.username),
  ];
  if (tags.length === 0) return null;

  return (
    <div className={fr.cx('fr-mt-4w')} style={{ textAlign: 'center' }}>
      <p className={fr.cx('fr-text--bold', 'fr-mb-1w')}>
        Bienvenue aux nouveaux venus
      </p>
      <ul
        className={fr.cx('fr-tags-group')}
        style={{ justifyContent: 'center' }}
      >
        {tags.map((label) => (
          <li key={label}>
            <Tag small>{label}</Tag>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EditionActivity({ activities }: Props) {
  const [periodKey, setPeriodKey] = useState(DEFAULT_PERIOD_KEY);
  const activity =
    activities.find((a) => a.period.key === periodKey) ?? activities[0];

  if (!activity) return null;

  const { totals, newcomers } = activity;
  // the DSFR expects a tuple of 1 to 5 segments; activities is not empty here
  const segments = ACTIVITY_PERIODS.filter((p) =>
    activities.some((a) => a.period.key === p.key),
  ).map((p) => ({
    label: p.label,
    nativeInputProps: {
      value: p.key,
      checked: p.key === activity.period.key,
      onChange: () => setPeriodKey(p.key),
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
        <h2 className="section__title">La communauté du RNB</h2>
        <p className="section__subtitle">{activityHeadline(activity)}</p>
      </div>
      <div
        className={fr.cx('fr-mb-4w')}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <SegmentedControl legend="Période" hideLegend segments={segments} />
      </div>

      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
          <FigureCard
            label="Contributions"
            value={totals.editions}
            desc={trendText(activity)}
          />
        </div>
        <div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
          <FigureCard
            label="Communes éditées"
            value={totals.cities}
            desc={
              newcomers.count?.cities
                ? `dont ${formatNumber(newcomers.count.cities)} pour la première fois`
                : null
            }
          />
        </div>
        <div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
          <FigureCard
            label="Contributeurs actifs"
            value={totals.editors}
            desc={
              newcomers.count?.users
                ? `dont ${plural(newcomers.count.users, 'nouveau', 'nouveaux')}`
                : null
            }
          />
        </div>
      </div>

      {totals.editions > 0 && <Rankings activity={activity} />}

      <Newcomers activity={activity} />

      <ButtonsGroup
        className={fr.cx('fr-mt-4w')}
        inlineLayoutWhen="md and up"
        alignment="center"
        buttons={[
          {
            children: 'Rejoindre les contributeurs',
            linkProps: { href: '/inscription' },
          },
          {
            children: 'Toutes les statistiques',
            priority: 'secondary',
            linkProps: { href: '/stats' },
          },
        ]}
      />
    </section>
  );
}
