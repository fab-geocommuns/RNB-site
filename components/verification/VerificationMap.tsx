'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fr } from '@codegouvfr/react-dsfr';
import { installBAN } from '@/components/map/layers/ban';
import { installBuildings } from '@/components/map/layers/buildings';
import { CaseGeometries } from '@/components/verification/useCaseGeometries';

const { decisions, options } = fr.colors.getHex({ isDark: false });
export const RNB_COLOR = decisions.text.default.error.default;
export const BDTOPO_COLOR = options.blueCumulus.main526.default;
export const FILL_OPACITY = 0.25;

const SRC_RNB = 'verification-rnb';
const SRC_REPORTS = 'verification-reports';
const SRC_EXTRA = 'verification-extra';

export const ADDRESS_COLORS = {
  'linked-certified': decisions.text.default.success.default,
  linked: decisions.text.default.warning.default,
  nearby: decisions.text.mention.grey.default,
  link: decisions.artwork.major.blueFrance.default,
};

export const REPORT_COLORS: Record<string, string> = {
  pending: decisions.text.default.warning.default,
  fixed: decisions.text.default.success.default,
  rejected: decisions.text.mention.grey.default,
};

// Signalement tel que lu dans les tuiles vectorielles (pas de rnb_id : le
// détail vient de `reports/<id>/`).
export type MapReport = {
  id: number;
  status: string;
  lon: number;
  lat: number;
};
const SRC_BDTOPO = 'verification-bdtopo';

const EMPTY: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

function toCollection(geometry: GeoJSON.Geometry | null) {
  if (!geometry) return EMPTY;
  return {
    type: 'FeatureCollection' as const,
    features: [{ type: 'Feature' as const, properties: {}, geometry }],
  };
}

function installReports(map: maplibregl.Map) {
  if (map.getSource(SRC_REPORTS)) return;
  map.addSource(SRC_REPORTS, {
    type: 'vector',
    tiles: [
      `${process.env.NEXT_PUBLIC_API_BASE}/reports/tiles/{x}/{y}/{z}.pbf`,
    ],
    minzoom: 10,
    maxzoom: 16,
  });
  map.addLayer({
    id: `${SRC_REPORTS}-circle`,
    source: SRC_REPORTS,
    'source-layer': 'default',
    type: 'circle',
    paint: {
      'circle-radius': 7,
      'circle-color': [
        'match',
        ['get', 'status'],
        'pending',
        REPORT_COLORS.pending,
        'fixed',
        REPORT_COLORS.fixed,
        REPORT_COLORS.rejected,
      ],
      'circle-stroke-color': decisions.background.default.grey.default,
      'circle-stroke-width': 2,
    },
  });
}

function reportsInView(map: maplibregl.Map): MapReport[] {
  if (!map.getSource(SRC_REPORTS)) return [];
  const byId = new Map<number, MapReport>();
  for (const f of map.querySourceFeatures(SRC_REPORTS, {
    sourceLayer: 'default',
  })) {
    const id = Number(f.properties.id);
    if (byId.has(id) || f.geometry.type !== 'Point') continue;
    const [lon, lat] = f.geometry.coordinates;
    byId.set(id, { id, status: String(f.properties.status), lon, lat });
  }
  return Array.from(byId.values());
}

type OverlayOptions = {
  withBan: boolean;
  withReports: boolean;
  withRnbBuildings: boolean;
};

function installExtra(map: maplibregl.Map) {
  if (map.getSource(SRC_EXTRA)) return;
  map.addSource(SRC_EXTRA, { type: 'geojson', data: EMPTY });
  map.addLayer({
    id: `${SRC_EXTRA}-link`,
    source: SRC_EXTRA,
    type: 'line',
    filter: ['==', ['get', 'kind'], 'link'],
    paint: {
      'line-color': ADDRESS_COLORS.link,
      'line-width': 2,
      'line-dasharray': [2, 1],
    },
  });
  map.addLayer({
    id: `${SRC_EXTRA}-point`,
    source: SRC_EXTRA,
    type: 'circle',
    filter: ['==', ['geometry-type'], 'Point'],
    paint: {
      'circle-radius': ['match', ['get', 'kind'], 'nearby', 4, 6],
      'circle-color': [
        'match',
        ['get', 'kind'],
        'linked-certified',
        ADDRESS_COLORS['linked-certified'],
        'linked',
        ADDRESS_COLORS.linked,
        ADDRESS_COLORS.nearby,
      ],
      'circle-stroke-color': decisions.background.default.grey.default,
      'circle-stroke-width': 2,
    },
  });
  map.addLayer({
    id: `${SRC_EXTRA}-label`,
    source: SRC_EXTRA,
    type: 'symbol',
    filter: ['==', ['geometry-type'], 'Point'],
    layout: {
      'text-field': ['get', 'label'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 13,
      'text-offset': [0, -1.2],
    },
    paint: {
      'text-color': decisions.text.default.grey.default,
      'text-halo-color': decisions.background.default.grey.default,
      'text-halo-width': 2,
    },
  });
}

async function installOverlays(
  map: maplibregl.Map,
  { withBan, withReports, withRnbBuildings }: OverlayOptions,
) {
  // Couche bâtiments du site (« carte RNB classique ») d'abord : nos contours
  // doivent rester au-dessus.
  if (withRnbBuildings && !map.getSource('bdgtiles_shapes')) {
    try {
      await installBuildings(map, {
        layers: {
          background: 'vectorIgnStandard',
          buildings: 'polygon',
          extraLayers: ['validated', 'demolished'],
        },
      });
    } catch (error) {
      // Sans la couche du site, la carte garde au moins nos contours.
      console.error('Couche bâtiments RNB non installée', error);
    }
  }
  if (withBan) installBAN(map);
  if (withReports) installReports(map);
  if (!map.getSource(SRC_BDTOPO)) {
    map.addSource(SRC_BDTOPO, { type: 'geojson', data: EMPTY });
    map.addLayer({
      id: `${SRC_BDTOPO}-fill`,
      source: SRC_BDTOPO,
      type: 'fill',
      filter: ['!=', ['geometry-type'], 'Point'],
      paint: { 'fill-color': BDTOPO_COLOR, 'fill-opacity': FILL_OPACITY },
    });
    map.addLayer({
      id: `${SRC_BDTOPO}-line`,
      source: SRC_BDTOPO,
      type: 'line',
      filter: ['!=', ['geometry-type'], 'Point'],
      paint: { 'line-color': BDTOPO_COLOR, 'line-width': 2 },
    });
  }
  if (!map.getSource(SRC_RNB)) {
    map.addSource(SRC_RNB, { type: 'geojson', data: EMPTY });
    map.addLayer({
      id: `${SRC_RNB}-fill`,
      source: SRC_RNB,
      type: 'fill',
      filter: ['!=', ['geometry-type'], 'Point'],
      paint: { 'fill-color': RNB_COLOR, 'fill-opacity': FILL_OPACITY },
    });
    map.addLayer({
      id: `${SRC_RNB}-line`,
      source: SRC_RNB,
      type: 'line',
      filter: ['!=', ['geometry-type'], 'Point'],
      paint: { 'line-color': RNB_COLOR, 'line-width': 3 },
    });
    map.addLayer({
      id: `${SRC_RNB}-point`,
      source: SRC_RNB,
      type: 'circle',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 6,
        'circle-color': RNB_COLOR,
        'circle-stroke-color': decisions.background.default.grey.default,
        'circle-stroke-width': 2,
      },
    });
  }
  installExtra(map);
}

// Nos couches (contours RNB et BD Topo, adresses et liens) : masquables
// d'un coup pour mieux voir le fond de carte.
const OWN_SOURCES = [SRC_RNB, SRC_BDTOPO, SRC_EXTRA];

function setOverlaysVisible(map: maplibregl.Map, visible: boolean) {
  for (const layer of map.getStyle()?.layers ?? []) {
    if ('source' in layer && OWN_SOURCES.includes(layer.source)) {
      map.setLayoutProperty(
        layer.id,
        'visibility',
        visible ? 'visible' : 'none',
      );
    }
  }
}

function setExtraData(
  map: maplibregl.Map,
  extra: GeoJSON.FeatureCollection | undefined,
) {
  (map.getSource(SRC_EXTRA) as maplibregl.GeoJSONSource | undefined)?.setData(
    extra ?? EMPTY,
  );
}

function setOverlayData(map: maplibregl.Map, geometries: CaseGeometries) {
  (map.getSource(SRC_RNB) as maplibregl.GeoJSONSource | undefined)?.setData(
    toCollection(geometries.rnb),
  );
  (map.getSource(SRC_BDTOPO) as maplibregl.GeoJSONSource | undefined)?.setData(
    toCollection(geometries.bdtopo),
  );
}

export type MapRegistry = {
  register: (map: maplibregl.Map) => () => void;
};

export default function VerificationMap({
  mapStyle,
  withBan = false,
  withRnbBuildings = false,
  overlaysVisible = true,
  extra,
  onReportsInView,
  geometries,
  bounds,
  registry,
}: {
  mapStyle: StyleSpecification;
  withBan?: boolean;
  // Couche bâtiments de la carte du site, comme sur /carte.
  withRnbBuildings?: boolean;
  // false : masque les contours et les adresses, pour voir le fond.
  overlaysVisible?: boolean;
  // Points et traits en plus (adresses, liens bâti-adresse).
  extra?: GeoJSON.FeatureCollection;
  // Si fourni : affiche les signalements et donne ceux des tuiles chargées.
  onReportsInView?: (reports: MapReport[]) => void;
  geometries: CaseGeometries;
  bounds: maplibregl.LngLatBoundsLike | null;
  registry: MapRegistry;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geometriesRef = useRef(geometries);
  geometriesRef.current = geometries;
  const extraRef = useRef(extra);
  extraRef.current = extra;
  const visibleRef = useRef(overlaysVisible);
  visibleRef.current = overlaysVisible;
  const onReportsRef = useRef(onReportsInView);
  onReportsRef.current = onReportsInView;

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [2.5, 46.6],
      zoom: 5,
      maxZoom: 21,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    map.on('style.load', async () => {
      await installOverlays(map, {
        withBan,
        withReports: Boolean(onReportsRef.current),
        withRnbBuildings,
      });
      setOverlayData(map, geometriesRef.current);
      setExtraData(map, extraRef.current);
      setOverlaysVisible(map, visibleRef.current);
    });
    map.on('idle', () => onReportsRef.current?.(reportsInView(map)));
    mapRef.current = map;
    const unregister = registry.register(map);
    return () => {
      unregister();
      map.remove();
      mapRef.current = null;
    };
    // La carte est créée une fois ; le style change via setStyle plus bas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const styleRef = useRef(mapStyle);
  useEffect(() => {
    const map = mapRef.current;
    if (map && styleRef.current !== mapStyle) {
      styleRef.current = mapStyle;
      // diff: false force un rechargement complet : sinon MapLibre applique
      // seulement la différence, supprime les couches ajoutées (contours) et
      // ne déclenche pas `style.load`, qui les réinstalle.
      map.setStyle(mapStyle, { diff: false });
    }
  }, [mapStyle]);

  useEffect(() => {
    const map = mapRef.current;
    // Pas isStyleLoaded() : il reste faux tant que des tuiles chargent.
    if (map?.getSource(SRC_RNB)) setOverlayData(map, geometries);
  }, [geometries]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.getSource(SRC_EXTRA)) setExtraData(map, extra);
  }, [extra]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.getSource(SRC_RNB)) setOverlaysVisible(map, overlaysVisible);
  }, [overlaysVisible]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && bounds) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 19, duration: 0 });
    }
  }, [bounds]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
