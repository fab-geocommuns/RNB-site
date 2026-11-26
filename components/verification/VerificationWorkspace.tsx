'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { fr } from '@codegouvfr/react-dsfr';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { Upload } from '@codegouvfr/react-dsfr/Upload';
import { STYLES } from '@/components/map/layers/backgrounds';
import VerificationMap, {
  BDTOPO_COLOR,
  FILL_OPACITY,
  MapRegistry,
  ADDRESS_COLORS,
  MapReport,
  REPORT_COLORS,
  RNB_COLOR,
} from '@/components/verification/VerificationMap';
import BuildingInfo, { History } from '@/components/verification/BuildingInfo';
import BuildingSearch from '@/components/verification/BuildingSearch';
import AddressesPane from '@/components/verification/AddressesPane';
import ValidationPane from '@/components/verification/ValidationPane';
import {
  addressesOverlay,
  useBuildingAddresses,
} from '@/components/verification/useBuildingAddresses';
import { useCaseGeometries } from '@/components/verification/useCaseGeometries';
import {
  DEFAULT_OLD_PERIOD,
  ORTHO_PERIODS,
  OrthoPeriod,
  oldOrthoStyle,
} from '@/components/verification/orthoStyles';
import {
  CaseResult,
  MAX_VERDICTS,
  VerificationSession,
  columnIndex,
  createSession,
  exportFileName,
  exportSession,
  loadSession,
  parseVerdictList,
  rnbIdOf,
  saveSession,
} from '@/utils/verification/session';

const VERDICT_SEVERITY = {
  demoli: 'error',
  debout: 'success',
  doute: 'warning',
} as const;

function VerdictBadge({ verdict }: { verdict: string }) {
  if (!verdict) return null;
  return (
    <Badge
      small
      noIcon
      severity={
        VERDICT_SEVERITY[verdict as keyof typeof VERDICT_SEVERITY] ?? 'info'
      }
    >
      {verdict}
    </Badge>
  );
}

// Les cartes se suivent : tout mouvement de l'une (glisser, molette, inertie,
// recentrage) est recopié sur les autres. On ne filtre pas sur
// `originalEvent` : les animations de molette et d'inertie n'en portent qu'à
// leur première image. Le drapeau `syncing` évite que les cartes se renvoient
// le mouvement en boucle.
function useMapRegistry(): MapRegistry {
  const maps = useRef(new Set<maplibregl.Map>());
  const syncing = useRef(false);
  return useMemo(
    () => ({
      register(map) {
        maps.current.add(map);
        const onMove = () => {
          if (syncing.current) return;
          syncing.current = true;
          const camera = {
            center: map.getCenter(),
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch(),
          };
          try {
            maps.current.forEach((other) => {
              if (other !== map) other.jumpTo(camera);
            });
          } finally {
            syncing.current = false;
          }
        };
        map.on('move', onMove);
        return () => {
          map.off('move', onMove);
          maps.current.delete(map);
        };
      },
    }),
    [],
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: '1.25rem',
        height: '0.875rem',
        marginRight: fr.spacing('1v'),
        verticalAlign: 'middle',
        border: `2px solid ${color}`,
        background: `color-mix(in srgb, ${color} ${FILL_OPACITY * 100}%, transparent)`,
      }}
    />
  );
}

function Dot({ color }: { color: string }) {
  return <span style={{ color }}>●</span>;
}

const legendModal = createModal({
  id: 'verification-legend',
  isOpenedByDefault: false,
});

// Barre au-dessus des tuiles : bouton « Légende » (modale) et choix de la vue.
function Legend({
  view,
  withBdTopo,
  actions,
}: {
  view: ViewId;
  withBdTopo: boolean;
  actions: React.ReactNode;
}) {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: fr.spacing('3v'),
        padding: `0 ${fr.spacing('1v')}`,
      }}
    >
      <Button
        size="small"
        priority="tertiary"
        iconId="fr-icon-information-line"
        nativeButtonProps={legendModal.buttonProps}
      >
        Légende
      </Button>
      {actions}
      <legendModal.Component title="Légende des cartes" size="small">
        <ul
          className="fr-text--sm fr-mb-0"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: fr.spacing('2v'),
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          <li>
            <Swatch color={RNB_COLOR} />
            Bâtiment RNB (rnb_id)
          </li>
          {withBdTopo && (
            <li>
              <Swatch color={BDTOPO_COLOR} />
              Bâtiment BD Topo candidat (cleabs_bdtopo)
            </li>
          )}
          {view === 'cartes' ? (
            <>
              <li>
                Adresses BAN (plan) :{' '}
                <Dot color={ADDRESS_COLORS['linked-certified']} /> certifiée{' '}
                <Dot color={ADDRESS_COLORS.nearby} /> non certifiée
              </li>
              <li>
                Signalements (plan) : <Dot color={REPORT_COLORS.pending} />{' '}
                ouvert <Dot color={REPORT_COLORS.fixed} /> corrigé{' '}
                <Dot color={REPORT_COLORS.rejected} /> refusé
              </li>
              <li>
                Carte RNB : bâtiments du référentiel, coche = validé, rouge =
                démoli
              </li>
            </>
          ) : (
            <>
              <li>
                <Dot color={ADDRESS_COLORS['linked-certified']} /> Adresse liée,
                certifiée BAN
              </li>
              <li>
                <Dot color={ADDRESS_COLORS.linked} /> Adresse liée, non
                certifiée
              </li>
              <li>
                <Dot color={ADDRESS_COLORS.nearby} /> Adresse BAN proche, non
                liée
              </li>
              <li>
                <span style={{ color: ADDRESS_COLORS.link }}>- - -</span> Lien
                entre le bâtiment et une adresse liée
              </li>
            </>
          )}
        </ul>
      </legendModal.Component>
    </div>
  );
}

function Pane({
  title,
  actions,
  scroll = false,
  children,
}: {
  title: React.ReactNode;
  actions?: React.ReactNode;
  // Contenu texte (pas une carte) : défile, avec une marge intérieure.
  scroll?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: fr.spacing('2v'),
          padding: `${fr.spacing('1v')} ${fr.spacing('2v')}`,
          background: fr.colors.decisions.background.alt.grey.default,
        }}
      >
        <h2 className="fr-text--sm fr-text--bold fr-mb-0">{title}</h2>
        {actions}
      </header>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          ...(scroll ? { overflowY: 'auto', padding: fr.spacing('3v') } : {}),
        }}
      >
        {children}
      </div>
    </section>
  );
}

const VIEWS = {
  cartes: 'Vérifier le bâti (cartes)',
  validation: 'Vérifier une validation',
} as const;
type ViewId = keyof typeof VIEWS;
const VIEW_KEY = 'rnb-verification-batiments:vue';

function readView(): ViewId {
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    return saved && saved in VIEWS ? (saved as ViewId) : 'cartes';
  } catch {
    return 'cartes';
  }
}

function VerdictEditor({
  verdicts,
  onChange,
}: {
  verdicts: string[];
  onChange: (verdicts: string[]) => void;
}) {
  const [text, setText] = useState(verdicts.join(', '));
  useEffect(() => setText(verdicts.join(', ')), [verdicts]);
  const parsed = parseVerdictList(text);
  return (
    <Accordion label="Verdicts proposés">
      <Input
        label="Valeurs séparées par des virgules"
        hintText={`Au plus ${MAX_VERDICTS}, touches 1 à ${MAX_VERDICTS}. Elles sont écrites telles quelles dans la colonne verdict.`}
        nativeInputProps={{
          value: text,
          onChange: (e) => setText(e.target.value),
        }}
      />
      <Button
        size="small"
        disabled={
          parsed.length === 0 || parsed.join(',') === verdicts.join(',')
        }
        onClick={() => onChange(parsed)}
      >
        Appliquer
      </Button>
    </Accordion>
  );
}

function readQueryRnbId(): string | null {
  const q = new URLSearchParams(window.location.search).get('q');
  return q ? q.trim().toUpperCase() : null;
}

// Garde ?q=<rnb_id> dans l'URL : la barre d'adresse est toujours le lien de
// partage du bâtiment affiché.
function writeQueryRnbId(rnbId: string | null) {
  const url = new URL(window.location.href);
  if (rnbId) url.searchParams.set('q', rnbId);
  else url.searchParams.delete('q');
  if (url.href !== window.location.href) {
    window.history.replaceState(window.history.state, '', url);
  }
}

export default function VerificationWorkspace() {
  const [session, setSession] = useState<VerificationSession | null>(null);
  // Bâtiment cherché hors de la liste (recherche ou lien partagé).
  const [offListRnbId, setOffListRnbId] = useState<string | null>(null);
  // La page ne se rend qu'après lecture du localStorage, côté navigateur.
  const [ready, setReady] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [oldPeriod, setOldPeriod] = useState<OrthoPeriod>(DEFAULT_OLD_PERIOD);
  const [view, setView] = useState<ViewId>('cartes');
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [mapReports, setMapReports] = useState<MapReport[]>([]);
  const registry = useMapRegistry();
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = loadSession();
    const q = readQueryRnbId();
    setSession(saved);
    if (q && (!saved || rnbIdOf(saved, saved.current) !== q)) {
      setOffListRnbId(q);
    }
    setView(readView());
    setReady(true);
  }, []);

  useEffect(() => {
    if (session) setStorageError(!saveSession(session));
  }, [session]);

  const current = session?.current ?? 0;
  const caseRnbId = session ? rnbIdOf(session, current) : '';
  const isOffList = offListRnbId !== null && offListRnbId !== caseRnbId;
  const rnbId = isOffList ? offListRnbId : caseRnbId;
  const cleabsIdx = session ? columnIndex(session.table, 'cleabs_bdtopo') : -1;
  const cleabs =
    session && !isOffList && cleabsIdx !== -1
      ? session.table.rows[current]?.[cleabsIdx]?.trim() || null
      : null;
  const caseData = useCaseGeometries(rnbId, cleabs);
  const addresses = useBuildingAddresses(
    view === 'validation' ? caseData.building : null,
    caseData.center,
  );
  const addressFeatures = useMemo(
    () => addressesOverlay(caseData.center, addresses),
    [caseData.center, addresses],
  );

  const changeView = (next: ViewId) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Préférence non gardée : sans conséquence.
    }
  };
  const result = session?.results[current];
  const savedVerdicts = session?.verdicts;
  const verdicts = useMemo(() => savedVerdicts ?? [], [savedVerdicts]);
  const doneCount = session?.results.filter((r) => r.verdict).length ?? 0;

  useEffect(() => {
    if (ready) writeQueryRnbId(rnbId || null);
  }, [ready, rnbId]);

  const onReportsInView = useCallback((reports: MapReport[]) => {
    setMapReports((previous) =>
      previous.map((r) => r.id).join() === reports.map((r) => r.id).join()
        ? previous
        : reports,
    );
  }, []);

  const goTo = useCallback((index: number) => {
    setOffListRnbId(null);
    setSession((s) =>
      s && index >= 0 && index < s.table.rows.length
        ? { ...s, current: index }
        : s,
    );
  }, []);

  const updateResult = useCallback((patch: Partial<CaseResult>) => {
    setSession((s) => {
      if (!s) return s;
      const results = [...s.results];
      results[s.current] = { ...results[s.current], ...patch };
      return { ...s, results };
    });
  }, []);

  // Raccourcis : 1 à 9 pour le verdict, flèches gauche/droite pour naviguer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable="true"]') ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }
      const verdict = verdicts[Number(e.key) - 1];
      if (verdict && session && !isOffList) {
        updateResult({ verdict });
      } else if (e.key === 'ArrowRight' && session) {
        goTo(isOffList ? current : current + 1);
      } else if (e.key === 'ArrowLeft' && session) {
        goTo(isOffList ? current : current - 1);
      } else if (e.key === 'm') {
        setOverlaysVisible((v) => !v);
      } else if (e.key === 'c' && session && !isOffList) {
        e.preventDefault();
        commentRef.current?.focus();
      } else {
        return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goTo, updateResult, verdicts, session, isOffList]);

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      setSession(createSession(file.name, text, loadSession(file.name)));
      setOffListRnbId(null);
      setImportError(null);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'Fichier illisible.',
      );
    }
  };

  const onExport = () => {
    if (!session) return;
    const blob = new Blob([exportSession(session)], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName(session.fileName);
    link.click();
    URL.revokeObjectURL(url);
  };

  const oldStyle = useMemo(() => oldOrthoStyle(oldPeriod), [oldPeriod]);
  const geometries = caseData.geometries;
  const bounds = caseData.bounds;

  if (!ready) return null;

  return (
    <div
      style={{
        display: 'flex',
        flex: '1 1 0',
        minHeight: 0,
        height: 'calc(100vh - 8rem)',
      }}
    >
      <aside
        style={{
          width: '26rem',
          flexShrink: 0,
          overflowY: 'auto',
          padding: fr.spacing('3v'),
          borderRight: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        }}
      >
        <h1 className="fr-h5 fr-mb-2v">Vérification de bâtiments</h1>
        <BuildingSearch onSelect={setOffListRnbId} />

        {session && (
          <>
            <hr className="fr-mt-2v fr-pb-2v" />
            <p className="fr-text--sm fr-mb-1v">
              <strong>{session.fileName}</strong> · {doneCount} /{' '}
              {session.table.rows.length} vérifiés
            </p>
            <div
              style={{
                display: 'flex',
                gap: fr.spacing('2v'),
                alignItems: 'center',
              }}
            >
              <Button
                size="small"
                priority="secondary"
                iconId="fr-icon-arrow-left-line"
                title="Cas précédent (←)"
                disabled={current === 0 && !isOffList}
                onClick={() => goTo(isOffList ? current : current - 1)}
              />
              <Select
                label={null}
                className="fr-mb-0"
                style={{ flex: 1 }}
                nativeSelectProps={{
                  value: current,
                  onChange: (e) => goTo(Number(e.target.value)),
                  'aria-label': 'Cas',
                }}
              >
                {session.table.rows.map((_, i) => (
                  <option key={i} value={i}>
                    {i + 1}. {rnbIdOf(session, i)}
                    {session.results[i].verdict
                      ? ` · ${session.results[i].verdict}`
                      : ''}
                  </option>
                ))}
              </Select>
              <Button
                size="small"
                priority="secondary"
                iconId="fr-icon-arrow-right-line"
                title="Cas suivant (→)"
                disabled={
                  current === session.table.rows.length - 1 && !isOffList
                }
                onClick={() => goTo(isOffList ? current : current + 1)}
              />
            </div>
          </>
        )}

        {isOffList && (
          <Alert
            className="fr-mt-2v"
            severity="info"
            small
            description={
              session ? (
                <>
                  Bâtiment hors liste, consultation seule.{' '}
                  <button
                    type="button"
                    className="fr-link fr-link--sm"
                    onClick={() => goTo(current)}
                  >
                    Revenir au cas {current + 1}
                  </button>
                </>
              ) : (
                'Consultation seule : importez un CSV pour saisir des verdicts.'
              )
            }
          />
        )}

        {rnbId && (
          <h2 className="fr-h6 fr-mt-3v fr-mb-1v">
            {rnbId}{' '}
            {!isOffList && result && <VerdictBadge verdict={result.verdict} />}
          </h2>
        )}
        {caseData.loading && (
          <p className="fr-text--sm">Chargement du bâtiment…</p>
        )}
        {caseData.error && (
          <Alert severity="error" small description={caseData.error} />
        )}
        {caseData.building && (
          <BuildingInfo
            building={caseData.building}
            center={caseData.center}
            reports={mapReports}
          />
        )}

        {session && result && !isOffList && (
          <>
            <RadioButtons
              className="fr-mt-3v fr-mb-2v"
              legend={`Verdict (touches 1 à ${verdicts.length})`}
              orientation="horizontal"
              small
              options={verdicts.map((v, i) => ({
                label: `${v} (${i + 1})`,
                nativeInputProps: {
                  checked: result.verdict === v,
                  onChange: () => updateResult({ verdict: v }),
                },
              }))}
            />
            <Input
              label="Commentaire (touche c)"
              textArea
              nativeTextAreaProps={{
                ref: commentRef,
                rows: 3,
                value: result.commentaire,
                onChange: (e) => updateResult({ commentaire: e.target.value }),
                onKeyDown: (e) => {
                  if (e.key === 'Escape') e.currentTarget.blur();
                },
              }}
            />
            <div style={{ display: 'flex', gap: fr.spacing('2v') }}>
              <Button
                size="small"
                priority="tertiary"
                disabled={!result.verdict && !result.commentaire}
                onClick={() => updateResult({ verdict: '', commentaire: '' })}
              >
                Effacer
              </Button>
              <Button
                size="small"
                disabled={current === session.table.rows.length - 1}
                onClick={() => goTo(current + 1)}
              >
                Suivant
              </Button>
            </div>

            <h3 className="fr-text--sm fr-text--bold fr-mt-4v fr-mb-1v">
              Données de la ligne
            </h3>
            <dl className="fr-text--xs fr-mb-2v">
              {session.table.header.map((name, i) => (
                <div
                  key={name + i}
                  style={{ display: 'flex', gap: fr.spacing('2v') }}
                >
                  <dt style={{ fontWeight: 700 }}>{name}</dt>
                  <dd style={{ margin: 0, wordBreak: 'break-all' }}>
                    {session.table.rows[current][i]}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}

        <hr className="fr-mt-2v fr-pb-2v" />
        <Upload
          label={session ? 'Importer un autre CSV' : 'Importer un CSV'}
          hint="Une ligne par cas, avec une colonne rnb_id. Les verdicts déjà saisis pour ce fichier sont repris."
          nativeInputProps={{
            accept: '.csv,text/csv',
            onChange: (e) => onImport(e.target.files?.[0]),
          }}
        />
        {importError && (
          <Alert
            className="fr-mt-2v"
            severity="error"
            small
            description={importError}
          />
        )}
        {storageError && (
          <Alert
            className="fr-mt-2v"
            severity="warning"
            small
            description="Sauvegarde dans le navigateur impossible : exportez avant de fermer la page."
          />
        )}
        {session && (
          <>
            <div className="fr-accordions-group fr-mt-2v">
              <VerdictEditor
                verdicts={verdicts}
                onChange={(list) =>
                  setSession((s) => (s ? { ...s, verdicts: list } : s))
                }
              />
            </div>
            <Button
              className="fr-mt-2v"
              iconId="fr-icon-download-line"
              onClick={onExport}
            >
              Exporter le CSV
            </Button>
          </>
        )}
      </aside>

      {rnbId ? (
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto 1fr 1fr',
            gap: fr.spacing('1v'),
            padding: fr.spacing('1v'),
            minWidth: 0,
          }}
        >
          <Legend
            view={view}
            withBdTopo={!isOffList && cleabsIdx !== -1}
            actions={
              <>
                <Button
                  size="small"
                  priority={overlaysVisible ? 'tertiary' : 'secondary'}
                  iconId={
                    overlaysVisible
                      ? 'fr-icon-eye-off-line'
                      : 'fr-icon-eye-line'
                  }
                  title="Masquer ou afficher les contours (touche m)"
                  onClick={() => setOverlaysVisible((v) => !v)}
                >
                  {overlaysVisible
                    ? 'Masquer les contours (m)'
                    : 'Afficher les contours (m)'}
                </Button>
                <Select
                  label={null}
                  className="fr-mb-0"
                  nativeSelectProps={{
                    value: view,
                    onChange: (e) => changeView(e.target.value as ViewId),
                    'aria-label': 'Vue',
                  }}
                >
                  {Object.entries(VIEWS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </Select>
              </>
            }
          />
          {view === 'cartes' ? (
            <>
              <Pane title="Plan IGN, adresses BAN et signalements">
                <VerificationMap
                  key="plan"
                  mapStyle={STYLES.vectorIgnStandard.style}
                  withBan
                  onReportsInView={onReportsInView}
                  geometries={geometries}
                  bounds={bounds}
                  registry={registry}
                  overlaysVisible={overlaysVisible}
                />
              </Pane>
              <Pane title="Ortho actuelle">
                <VerificationMap
                  key="ortho"
                  mapStyle={STYLES.satellite.style}
                  geometries={geometries}
                  bounds={bounds}
                  registry={registry}
                  overlaysVisible={overlaysVisible}
                />
              </Pane>
              <Pane
                title="Ortho ancienne"
                actions={
                  <Select
                    label={null}
                    className="fr-mb-0"
                    nativeSelectProps={{
                      value: oldPeriod,
                      onChange: (e) =>
                        setOldPeriod(e.target.value as OrthoPeriod),
                      'aria-label': "Période de l'ortho ancienne",
                    }}
                  >
                    {ORTHO_PERIODS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                }
              >
                <VerificationMap
                  key="ortho-ancienne"
                  mapStyle={oldStyle}
                  geometries={geometries}
                  bounds={bounds}
                  registry={registry}
                  overlaysVisible={overlaysVisible}
                />
              </Pane>
              <Pane title="Carte RNB (bâtiments du référentiel)">
                <VerificationMap
                  key="rnb"
                  mapStyle={STYLES.vectorIgnStandard.style}
                  withRnbBuildings
                  geometries={geometries}
                  bounds={bounds}
                  registry={registry}
                  overlaysVisible={overlaysVisible}
                />
              </Pane>
            </>
          ) : (
            <>
              <Pane title="Ortho actuelle, adresses et liens bâti-adresse">
                <VerificationMap
                  key="ortho-adresses"
                  mapStyle={STYLES.satellite.style}
                  extra={addressFeatures}
                  geometries={geometries}
                  bounds={bounds}
                  registry={registry}
                  overlaysVisible={overlaysVisible}
                />
              </Pane>
              <Pane title="Validation" scroll>
                {caseData.building && (
                  <ValidationPane building={caseData.building} />
                )}
              </Pane>
              <Pane title="Historique" scroll>
                <History rnbId={rnbId} />
              </Pane>
              <Pane title="Adresses (BAN)" scroll>
                <AddressesPane addresses={addresses} />
              </Pane>
            </>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, padding: fr.spacing('6v') }}>
          <p>
            Cherchez un bâtiment par identifiant RNB ou par adresse, ou importez
            un CSV de cas à vérifier.
          </p>
        </div>
      )}
    </div>
  );
}
