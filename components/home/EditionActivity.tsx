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

import styles from '@/styles/editionActivity.module.scss';

import {
  ACTIVITY_PERIODS,
  activitySummary,
  DEFAULT_PERIOD_KEY,
  EditionActivity as EditionActivityData,
  editionsTrend,
  windowLabel,
} from '@/utils/editionActivity';

type Props = {
  activities: EditionActivityData[];
};

const formatNumber = (n: number) => n.toLocaleString('fr-FR');

const colors = fr.colors.decisions;

const plural = (n: number, singular: string, pluralForm: string) =>
  `${formatNumber(n)} ${n > 1 ? pluralForm : singular}`;

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

type RankingKey = 'users' | 'organizations' | 'cities';

const RANKINGS: { key: RankingKey; label: string; title: string }[] = [
  {
    key: 'users',
    label: 'Contributeurs',
    title: 'Contributeurs les plus actifs',
  },
  {
    key: 'organizations',
    label: 'Organisations',
    title: 'Organisations les plus actives',
  },
  { key: 'cities', label: 'Communes', title: 'Communes les plus éditées' },
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
  return activity.top.cities.map((c) => ({
    name: c.name,
    detail: c.department?.code ?? null,
    count: c.count,
  }));
}

// The 3 rankings side by side on large screens, in DSFR tabs on small ones
function Rankings({ activity }: { activity: EditionActivityData }) {
  return (
    <>
      {/* the visibility classes override display: they stay off the grid */}
      <div className={fr.cx('fr-hidden', 'fr-unhidden-md')}>
        <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
          {RANKINGS.map((r) => (
            <div key={r.key} className={fr.cx('fr-col-md-4')}>
              <Card
                border
                size="small"
                titleAs="h4"
                title={r.title}
                end={<RankingList rows={rankingRows(activity, r.key)} />}
              />
            </div>
          ))}
        </div>
      </div>
      <div className={fr.cx('fr-hidden-md')}>
        <Tabs
          label="Les plus actifs"
          // white panel, like the cards, on the colored band
          classes={{ panel: fr.cx('fr-p-3w') }}
          style={{ backgroundColor: colors.background.default.grey.default }}
          tabs={RANKINGS.map((r) => ({
            label: r.label,
            content: <RankingList rows={rankingRows(activity, r.key)} />,
          }))}
        />
      </div>
    </>
  );
}

// Departments, cities and users who made their very first contribution in
// the period, greeted with a waving hand
function Newcomers({ activity }: { activity: EditionActivityData }) {
  const { users, cities, departments } = activity.newcomers;
  const tags = [
    ...departments.map((d) => ({
      kind: 'Département',
      label: `${d.name} (${d.code})`,
      iconId: 'fr-icon-france-line' as const,
    })),
    ...cities.map((c) => ({
      kind: 'Commune',
      label: c.name,
      iconId: 'fr-icon-map-pin-2-line' as const,
    })),
    ...users.map((u) => ({
      kind: 'Contributeur',
      label: u.username,
      iconId: 'fr-icon-user-line' as const,
    })),
  ];
  if (tags.length === 0) return null;
  const window = windowLabel(activity.period.key);

  return (
    <div className={fr.cx('fr-mt-5w')} style={{ textAlign: 'center' }}>
      <h4 className={fr.cx('fr-h6', 'fr-mb-1w')}>
        <span aria-hidden="true" className={styles.wave}>
          👋
        </span>{' '}
        Bienvenue aux nouveaux venus !
      </h4>
      <p className={fr.cx('fr-text--sm', 'fr-mb-2w')}>
        {window
          ? `Leur toute première contribution date de ces ${window}.`
          : 'Leur toute première contribution date de cette période.'}{' '}
        Merci et bienvenue dans la communauté.
      </p>
      <ul
        className={fr.cx('fr-tags-group')}
        style={{ justifyContent: 'center' }}
      >
        {tags.map((t) => (
          <li key={`${t.kind}-${t.label}`}>
            <Tag iconId={t.iconId}>
              <span className={fr.cx('fr-sr-only')}>{t.kind} : </span>
              {t.label}
            </Tag>
          </li>
        ))}
      </ul>
    </div>
  );
}

const EDITION_GUIDE_URL =
  'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb';

// Where to start: understand the RNB, then contribute
const RESOURCES = [
  { label: 'Comment est construit le RNB', href: '/a-propos' },
  { label: 'Le guide de l’édition', href: EDITION_GUIDE_URL },
  { label: 'Foire aux questions', href: '/faq' },
];

// "+18 % par rapport aux 30 jours précédents · 2 communes et 1 contributeur
// pour la première fois"
function summaryDetail(activity: EditionActivityData): string | null {
  const count = activity.newcomers.count;
  const firsts = [
    count?.cities ? plural(count.cities, 'commune', 'communes') : null,
    count?.users ? plural(count.users, 'contributeur', 'contributeurs') : null,
  ].filter(Boolean);
  const parts = [
    trendText(activity),
    firsts.length ? `${firsts.join(' et ')} pour la première fois` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

export default function EditionActivity({ activities }: Props) {
  const [periodKey, setPeriodKey] = useState(DEFAULT_PERIOD_KEY);
  const activity =
    activities.find((a) => a.period.key === periodKey) ?? activities[0];

  if (!activity) return null;

  const detail = summaryDetail(activity);
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
      {/* 1. what the section is about */}
      <div className="section__titleblock">
        <h2 className="section__title">Participer au RNB</h2>
        <p className="section__subtitle">
          Le RNB se construit en continu : avec les bases nationales, et avec
          celles et ceux qui connaissent leur territoire.
        </p>
      </div>

      {/* 2. the activity: the summary heads everything below, the period
          selector drives it */}
      <div
        className={fr.cx('fr-mt-6w', 'fr-mb-3w')}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: fr.spacing('2w'),
        }}
      >
        <div>
          <h3 className={fr.cx('fr-h4', 'fr-mb-1v')}>
            {activitySummary(activity)}
          </h3>
          {detail && (
            <p
              className={fr.cx('fr-text--sm', 'fr-mb-0')}
              style={{ color: colors.text.mention.grey.default }}
            >
              {detail}
            </p>
          )}
        </div>
        <SegmentedControl legend="Période" hideLegend segments={segments} />
      </div>

      {activity.totals.editions > 0 && <Rankings activity={activity} />}

      <Newcomers activity={activity} />

      {/* 3. what to do next */}
      <ButtonsGroup
        className={fr.cx('fr-mt-6w')}
        inlineLayoutWhen="md and up"
        alignment="center"
        buttons={[
          {
            children: 'S’inscrire pour contribuer',
            linkProps: { href: '/inscription' },
          },
          {
            children: 'Toutes les statistiques',
            priority: 'secondary',
            linkProps: { href: '/stats' },
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
        {RESOURCES.map((r) => (
          <li key={r.href}>
            <a
              href={r.href}
              className={fr.cx(
                'fr-link',
                'fr-link--sm',
                'fr-icon-arrow-right-line',
                'fr-link--icon-right',
              )}
            >
              {r.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
