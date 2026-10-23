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
  ACTIVITY_PERIODS,
  activityHeadline,
  DEFAULT_PERIOD_KEY,
  EditionActivity as EditionActivityData,
  editionsTrend,
  IMPORT_STATS_SINCE,
} from '@/utils/editionActivity';

type Props = {
  activities: EditionActivityData[];
  importCount: number | null;
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

type RankingKey = 'organizations' | 'cities' | 'departments';

const RANKINGS: { key: RankingKey; label: string }[] = [
  { key: 'organizations', label: 'Organisations' },
  { key: 'cities', label: 'Communes' },
  { key: 'departments', label: 'Départements' },
];

function rankingRows(
  activity: EditionActivityData,
  key: RankingKey,
): RankingRow[] {
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

function TopContributorsCard({ activity }: { activity: EditionActivityData }) {
  return (
    <Card
      border
      size="small"
      titleAs="h3"
      title="Contributeurs les plus actifs"
      end={
        <RankingList
          rows={activity.top.users.map((u) => ({
            name: u.username,
            detail: u.organization_short_name,
            count: u.count,
          }))}
        />
      }
    />
  );
}

function RankingCard({ activity }: { activity: EditionActivityData }) {
  const [rankingKey, setRankingKey] = useState<RankingKey>('organizations');
  return (
    <Card
      border
      size="small"
      titleAs="h3"
      title="Les plus actifs"
      end={
        <>
          <ul className={fr.cx('fr-tags-group')}>
            {RANKINGS.map((r) => (
              <li key={r.key}>
                <Tag
                  small
                  pressed={r.key === rankingKey}
                  nativeButtonProps={{ onClick: () => setRankingKey(r.key) }}
                >
                  {r.label}
                </Tag>
              </li>
            ))}
          </ul>
          <RankingList rows={rankingRows(activity, rankingKey)} />
        </>
      }
    />
  );
}

function NewcomersCard({ activity }: { activity: EditionActivityData }) {
  const { users, cities, departments } = activity.newcomers;
  const tags = [
    ...departments.map((d) => `${d.name} (${d.code})`),
    ...cities.map((c) => c.name),
    ...users.map((u) => u.username),
  ];

  return (
    <Card
      border
      size="small"
      titleAs="h3"
      title="Bienvenue aux nouveaux venus"
      desc="Première contribution sur la période"
      end={
        <ul className={fr.cx('fr-tags-group')}>
          {tags.map((label) => (
            <li key={label}>
              <Tag small>{label}</Tag>
            </li>
          ))}
        </ul>
      }
    />
  );
}

const EDITION_GUIDE_URL =
  'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb';

// How the RNB is built: the national databases, the community, open data
function HowItWorks({ importCount }: { importCount: number | null }) {
  const importsSince = new Date(IMPORT_STATS_SINCE).getFullYear();
  const steps = [
    {
      title: 'Les bases nationales',
      desc:
        'BD TOPO de l’IGN et Bases Adresse Locales, importées régulièrement.' +
        (importCount
          ? ` ${formatNumber(importCount)} mises à jour depuis ${importsSince}.`
          : ''),
      href: '/a-propos',
    },
    {
      title: 'La communauté complète',
      desc: 'Collectivités, professionnels et citoyens corrigent les bâtiments qu’ils connaissent.',
      href: EDITION_GUIDE_URL,
    },
    {
      title: 'Tout le monde en profite',
      desc: 'Chaque modification est historisée et diffusée librement : carte, API et exports.',
      href: '/faq',
    },
  ];
  return (
    <>
      <h3 className={fr.cx('fr-h5', 'fr-mt-6w')}>
        Comment se construit le RNB ?
      </h3>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {steps.map((step, i) => (
          <div key={step.title} className={fr.cx('fr-col-12', 'fr-col-md-4')}>
            <Card
              border
              size="small"
              titleAs="h4"
              enlargeLink
              linkProps={{ href: step.href }}
              detail={`Étape ${i + 1}`}
              title={step.title}
              desc={step.desc}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default function EditionActivity({ activities, importCount }: Props) {
  const [periodKey, setPeriodKey] = useState(DEFAULT_PERIOD_KEY);
  const activity =
    activities.find((a) => a.period.key === periodKey) ?? activities[0];

  if (!activity) return null;

  const { totals, newcomers } = activity;
  const hasNewcomers =
    newcomers.users.length +
      newcomers.cities.length +
      newcomers.departments.length >
    0;
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
    <section className={fr.cx('fr-my-8w')}>
      <div
        className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-2w')}
        style={{ alignItems: 'flex-end' }}
      >
        <div className={fr.cx('fr-col-12', 'fr-col-lg-8')}>
          <h2 className={fr.cx('fr-mb-0')}>{activityHeadline(activity)}</h2>
        </div>
        <div className={fr.cx('fr-col-12', 'fr-col-lg-4')}>
          <SegmentedControl legend="Période" hideLegend segments={segments} />
        </div>
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

        {totals.editions > 0 && (
          <>
            <div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
              <TopContributorsCard activity={activity} />
            </div>
            <div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
              <RankingCard activity={activity} />
            </div>
          </>
        )}

        {hasNewcomers && (
          <div className={fr.cx('fr-col-12')}>
            <NewcomersCard activity={activity} />
          </div>
        )}
      </div>

      <HowItWorks importCount={importCount} />

      <ButtonsGroup
        className={fr.cx('fr-mt-5w')}
        inlineLayoutWhen="md and up"
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
