'use client';

import { useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
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
  ImportStats,
  monthName,
} from '@/utils/editionActivity';

type Props = {
  activities: EditionActivityData[];
  imports: ImportStats | null;
};

const formatNumber = (n: number) => n.toLocaleString('fr-FR');

const colors = fr.colors.decisions;

const tileStyle = {
  height: '100%',
  padding: fr.spacing('3w'),
  border: `1px solid ${colors.border.default.grey.default}`,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: fr.spacing('1w'),
};

function StatTile({
  label,
  value,
  detail,
  children,
}: {
  label: string;
  value: number;
  detail?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div style={tileStyle}>
      <span>{label}</span>
      <span
        className={fr.cx('fr-display--xs', 'fr-mb-0')}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(value)}
      </span>
      {detail && <span className={fr.cx('fr-text--bold')}>{detail}</span>}
      {children}
    </div>
  );
}

function TrendDetail({ activity }: { activity: EditionActivityData }) {
  const trend = editionsTrend(activity);
  const previous = activity.previous_period;
  if (trend === null || !previous) return null;

  const sign = trend > 0 ? '+' : '';
  const period = ACTIVITY_PERIODS.find((p) => p.key === activity.period.key);
  const reference = period
    ? `aux ${period.label} précédents`
    : 'à la période précédente';
  return (
    <span
      style={{
        color:
          trend >= 0
            ? colors.text.default.success.default
            : colors.text.default.error.default,
      }}
    >
      {sign}
      {trend} % par rapport {reference}
    </span>
  );
}

// Bar chart of the last 12 months, the months covered by the selected window
// highlighted
function MonthlySparkline({ activity }: { activity: EditionActivityData }) {
  const max = Math.max(1, ...activity.monthly.map((m) => m.editions));
  const firstMonth = activity.period.since?.slice(0, 7);
  const highlighted = (month: string) => !!firstMonth && month >= firstMonth;
  const description = activity.monthly
    .map((m) => `${monthName(m.month)} : ${formatNumber(m.editions)}`)
    .join(', ');

  return (
    <>
      <div
        role="img"
        aria-label={`Contributions des 12 derniers mois : ${description}`}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: fr.spacing('1v'),
          height: fr.spacing('7w'),
          marginTop: fr.spacing('1w'),
        }}
      >
        {activity.monthly.map((m) => (
          <span
            key={m.month}
            aria-hidden="true"
            style={{
              flex: 1,
              height: `${Math.max(4, (m.editions / max) * 100)}%`,
              backgroundColor: highlighted(m.month)
                ? colors.background.actionHigh.blueFrance.default
                : colors.background.actionLow.blueFrance.default,
            }}
          />
        ))}
      </div>
      <span className={fr.cx('fr-text--xs', 'fr-mb-0')}>12 derniers mois</span>
    </>
  );
}

function initials(name: string) {
  return name
    .replace(/[^A-Za-zÀ-ÿ]/g, '')
    .slice(0, 2)
    .toUpperCase();
}

function TopContributors({ activity }: { activity: EditionActivityData }) {
  const users = activity.top.users;
  return (
    <>
      <h3 className={fr.cx('fr-h5')}>Contributeurs les plus actifs</h3>
      <ol className={fr.cx('fr-raw-list')}>
        {users.map((u) => (
          <li
            key={u.username}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: fr.spacing('2w'),
              padding: `${fr.spacing('3v')} 0`,
              borderBottom: `1px solid ${colors.border.default.grey.default}`,
            }}
          >
            <span
              className={fr.cx('fr-text--bold')}
              style={{ width: fr.spacing('3w') }}
            >
              {u.rank}
            </span>
            <span
              aria-hidden="true"
              className={fr.cx('fr-text--bold')}
              style={{
                width: fr.spacing('5w'),
                height: fr.spacing('5w'),
                flex: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background.actionLow.blueFrance.default,
                color: colors.text.actionHigh.blueFrance.default,
              }}
            >
              {initials(u.username)}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className={fr.cx('fr-text--bold')}>{u.username}</span>
              {u.organization_short_name && (
                <span
                  className={fr.cx('fr-text--sm')}
                  style={{
                    display: 'block',
                    color: colors.text.mention.grey.default,
                  }}
                >
                  {u.organization_short_name}
                </span>
              )}
            </span>
            <span className={fr.cx('fr-text--bold')}>
              {formatNumber(u.count)}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

type RankingKey = 'organizations' | 'cities' | 'departments';

const RANKINGS: { key: RankingKey; label: string; title: string }[] = [
  {
    key: 'organizations',
    label: 'Organisations',
    title: 'Organisations les plus actives',
  },
  { key: 'cities', label: 'Communes', title: 'Communes les plus éditées' },
  {
    key: 'departments',
    label: 'Départements',
    title: 'Départements les plus édités',
  },
];

function rankingRows(activity: EditionActivityData, key: RankingKey) {
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
      detail: c.department ? `(${c.department.code})` : null,
      count: c.count,
    }));
  }
  return activity.top.departments.map((d) => ({
    name: d.name,
    detail: `(${d.code})`,
    count: d.count,
  }));
}

function Ranking({ activity }: { activity: EditionActivityData }) {
  const [rankingKey, setRankingKey] = useState<RankingKey>('organizations');
  const ranking = RANKINGS.find((r) => r.key === rankingKey)!;
  const rows = rankingRows(activity, rankingKey);
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <>
      <h3 className={fr.cx('fr-h5')}>{ranking.title}</h3>
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
      {rows.length === 0 ? (
        <p>Aucune donnée sur cette période.</p>
      ) : (
        <ol className={fr.cx('fr-raw-list')}>
          {rows.map((row) => (
            <li key={row.name} className={fr.cx('fr-mb-2w')}>
              <span
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: fr.spacing('2w'),
                }}
              >
                <span>
                  <span className={fr.cx('fr-text--bold')}>{row.name}</span>{' '}
                  {row.detail && (
                    <span
                      className={fr.cx('fr-text--sm')}
                      style={{ color: colors.text.mention.grey.default }}
                    >
                      {row.detail}
                    </span>
                  )}
                </span>
                <span className={fr.cx('fr-text--bold')}>
                  {formatNumber(row.count)}
                </span>
              </span>
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  height: fr.spacing('1w'),
                  marginTop: fr.spacing('1v'),
                  backgroundColor: colors.background.contrast.grey.default,
                }}
              >
                <span
                  style={{
                    display: 'block',
                    height: '100%',
                    width: `${(row.count / max) * 100}%`,
                    backgroundColor:
                      colors.background.actionHigh.blueFrance.default,
                  }}
                />
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

function Newcomers({ activity }: { activity: EditionActivityData }) {
  const { users, cities, departments } = activity.newcomers;
  const tags = [
    ...departments.map((d) => ({
      kind: 'Département',
      label: `${d.name} (${d.code})`,
    })),
    ...cities.map((c) => ({ kind: 'Commune', label: c.name })),
    ...users.map((u) => ({ kind: 'Contributeur', label: u.username })),
  ];
  if (tags.length === 0) return null;

  return (
    <div
      className={fr.cx('fr-mt-5w')}
      style={{
        padding: fr.spacing('3w'),
        backgroundColor: colors.background.alt.blueFrance.default,
      }}
    >
      <h3 className={fr.cx('fr-h6')}>Bienvenue aux nouveaux venus</h3>
      <ul className={fr.cx('fr-tags-group')}>
        {tags.map((t) => (
          <li key={`${t.kind}-${t.label}`}>
            <Tag>
              {t.kind} · {t.label}
            </Tag>
          </li>
        ))}
      </ul>
    </div>
  );
}

const EDITION_GUIDE_URL =
  'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb';

function Step({
  number,
  title,
  link,
  children,
}: {
  number: number;
  title: string;
  link: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: fr.spacing('2w') }}>
      <span
        aria-hidden="true"
        className={fr.cx('fr-text--bold')}
        style={{
          width: fr.spacing('5w'),
          height: fr.spacing('5w'),
          flex: 'none',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background.actionHigh.blueFrance.default,
          color: colors.text.inverted.grey.default,
        }}
      >
        {number}
      </span>
      <div>
        <h4 className={fr.cx('fr-h6', 'fr-mb-1w')}>{title}</h4>
        <p className={fr.cx('fr-text--sm', 'fr-mb-1w')}>{children}</p>
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
      </div>
    </div>
  );
}

// How the RNB is built: the national databases, the community, open data
function HowItWorks({
  imports,
  editions,
}: {
  imports: ImportStats | null;
  editions: number | null;
}) {
  const importsSince = new Date(IMPORT_STATS_SINCE).getFullYear();
  return (
    <div
      className={fr.cx('fr-mt-6w', 'fr-pt-5w')}
      style={{ borderTop: `1px solid ${colors.border.default.grey.default}` }}
    >
      <h3 className={fr.cx('fr-h5', 'fr-mb-4w')}>
        Comment se construit le RNB ?
      </h3>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
          <Step
            number={1}
            title="Les bases nationales"
            link={{ label: 'Comment est construit le RNB', href: '/a-propos' }}
          >
            Le RNB s&apos;appuie sur la BD TOPO de l&apos;IGN et les Bases
            Adresse Locales, importées régulièrement.
            {imports && imports.total > 0 && (
              <>
                {' '}
                <strong>{formatNumber(imports.total)}</strong> mises à jour
                depuis {importsSince}.
              </>
            )}
          </Step>
        </div>
        <div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
          <Step
            number={2}
            title="La communauté complète"
            link={{ label: "Le guide de l'édition", href: EDITION_GUIDE_URL }}
          >
            Collectivités, professionnels et citoyens corrigent la forme,
            l&apos;adresse ou le statut des bâtiments qu&apos;ils connaissent.
            {editions !== null && editions > 0 && (
              <>
                {' '}
                <strong>{formatNumber(editions)}</strong> contributions à ce
                jour.
              </>
            )}
          </Step>
        </div>
        <div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
          <Step
            number={3}
            title="Tout le monde en profite"
            link={{ label: 'Foire aux questions', href: '/faq' }}
          >
            Chaque modification est historisée, tracée et diffusée librement :
            carte, API et exports, sous licence ouverte.
          </Step>
        </div>
      </div>
    </div>
  );
}

export default function EditionActivity({ activities, imports }: Props) {
  const [periodKey, setPeriodKey] = useState(DEFAULT_PERIOD_KEY);
  const activity =
    activities.find((a) => a.period.key === periodKey) ?? activities[0];

  if (!activity) return null;

  const { totals, newcomers } = activity;
  const allTimeEditions =
    activities.find((a) => a.period.key === 'all')?.totals.editions ?? null;
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
        className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-4w')}
        style={{ alignItems: 'flex-end' }}
      >
        <div className={fr.cx('fr-col-12', 'fr-col-lg-8')}>
          <p
            className={fr.cx('fr-text--sm', 'fr-text--bold', 'fr-mb-1w')}
            style={{
              color: colors.text.actionHigh.blueFrance.default,
              textTransform: 'uppercase',
            }}
          >
            La communauté du RNB
          </p>
          <h2>{activityHeadline(activity)}</h2>
          <p className={fr.cx('fr-text--lg', 'fr-mb-0')}>
            Des collectivités, des professionnels et des citoyens corrigent
            chaque jour les bâtiments de leur territoire. Chaque contribution
            est tracée et profite à tous.
          </p>
        </div>
        <div className={fr.cx('fr-col-12', 'fr-col-lg-4')}>
          <SegmentedControl legend="Période" hideLegend segments={segments} />
        </div>
      </div>

      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-5w')}>
        <div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
          <StatTile
            label="Contributions"
            value={totals.editions}
            detail={<TrendDetail activity={activity} />}
          >
            <MonthlySparkline activity={activity} />
          </StatTile>
        </div>
        <div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
          <StatTile
            label="Communes éditées"
            value={totals.cities}
            detail={
              newcomers.count?.cities
                ? `dont ${formatNumber(newcomers.count.cities)} pour la première fois`
                : null
            }
          />
        </div>
        <div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
          <StatTile
            label="Contributeurs actifs"
            value={totals.editors}
            detail={
              newcomers.count?.users
                ? `dont ${formatNumber(newcomers.count.users)} ${newcomers.count.users > 1 ? 'nouveaux' : 'nouveau'}`
                : null
            }
          />
        </div>
      </div>

      {totals.editions > 0 && (
        <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
            <TopContributors activity={activity} />
          </div>
          <div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
            <Ranking activity={activity} />
          </div>
        </div>
      )}

      {activity.period.key !== 'all' && <Newcomers activity={activity} />}

      <HowItWorks imports={imports} editions={allTimeEditions} />

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
