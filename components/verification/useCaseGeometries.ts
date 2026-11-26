'use client';

import { useEffect, useState } from 'react';
import { LngLatBounds } from 'maplibre-gl';
import { rnbApi } from '@/utils/rnbApi';
import { SelectedBuilding } from '@/stores/map/map-slice';

// Réponse de `buildings/<id>/`, au format du reste du site.
export type ApiBuilding = SelectedBuilding;

export type CaseGeometries = {
  rnb: GeoJSON.Geometry | null;
  bdtopo: GeoJSON.Geometry | null;
};

export type CaseData = {
  loading: boolean;
  error: string | null;
  building: ApiBuilding | null;
  geometries: CaseGeometries;
  bounds: LngLatBounds | null;
  center: [number, number] | null;
};

const BDTOPO_WFS = 'https://data.geopf.fr/wfs/ows';

// Demi-côté de l'emprise de recherche autour du bâtiment RNB, en degrés
// (~300 m) : le candidat BD Topo le recouvre, il la croise forcément.
const BDTOPO_SEARCH_RADIUS = 0.003;

// Filtrer sur cleabs seul prend ~30 s (pas d'index) ; avec une emprise, < 1 s.
async function fetchBdTopo(
  cleabs: string,
  [lon, lat]: [number, number],
  signal: AbortSignal,
): Promise<GeoJSON.Geometry | null> {
  const r = BDTOPO_SEARCH_RADIUS;
  const bbox = [lon - r, lat - r, lon + r, lat + r].join(',');
  const url = new URL(BDTOPO_WFS);
  url.search = new URLSearchParams({
    SERVICE: 'WFS',
    VERSION: '2.0.0',
    REQUEST: 'GetFeature',
    TYPENAMES: 'BDTOPO_V3:batiment',
    OUTPUTFORMAT: 'application/json',
    SRSNAME: 'EPSG:4326',
    CQL_FILTER: `BBOX(geometrie,${bbox},'EPSG:4326') AND cleabs='${cleabs.replace(/'/g, "''")}'`,
  }).toString();
  const response = await fetch(url, { signal });
  if (!response.ok) return null;
  const data = (await response.json()) as GeoJSON.FeatureCollection;
  return data.features[0]?.geometry ?? null;
}

function extendBounds(bounds: LngLatBounds, geometry: GeoJSON.Geometry) {
  const visit = (coords: unknown): void => {
    if (
      Array.isArray(coords) &&
      typeof coords[0] === 'number' &&
      typeof coords[1] === 'number'
    ) {
      bounds.extend([coords[0], coords[1]]);
    } else if (Array.isArray(coords)) {
      coords.forEach(visit);
    }
  };
  if (geometry.type === 'GeometryCollection') {
    geometry.geometries.forEach((g) => extendBounds(bounds, g));
  } else {
    visit(geometry.coordinates);
  }
}

const EMPTY: CaseData = {
  loading: false,
  error: null,
  building: null,
  geometries: { rnb: null, bdtopo: null },
  bounds: null,
  center: null,
};

// Charge le bâtiment RNB (API) et, si la ligne en porte un, le bâtiment
// BD Topo (WFS Géoplateforme) d'un cas.
export function useCaseGeometries(
  rnbId: string,
  cleabs: string | null,
): CaseData {
  const [data, setData] = useState<CaseData>(EMPTY);

  useEffect(() => {
    if (!rnbId) {
      setData(EMPTY);
      return;
    }
    const controller = new AbortController();
    setData({ ...EMPTY, loading: true });

    const show = (
      building: ApiBuilding,
      bdtopo: GeoJSON.Geometry | null,
    ): [number, number] | null => {
      const rnb = building.shape ?? building.point;
      const bounds = new LngLatBounds();
      if (rnb) extendBounds(bounds, rnb);
      if (bdtopo) extendBounds(bounds, bdtopo);
      const center: [number, number] | null = building.point
        ? [building.point.coordinates[0], building.point.coordinates[1]]
        : bounds.isEmpty()
          ? null
          : bounds.getCenter().toArray();
      setData((previous) => ({
        loading: false,
        error: null,
        building,
        geometries: { rnb, bdtopo },
        bounds: bounds.isEmpty() ? null : bounds,
        // Même référence tant que le bâtiment ne change pas : Panoramax ne
        // relance pas sa recherche quand la BD Topo arrive.
        center: previous.building === building ? previous.center : center,
      }));
      return center;
    };

    rnbApi
      .get<Omit<ApiBuilding, '_type'>>(
        `buildings/${encodeURIComponent(rnbId)}/`,
        { signal: controller.signal },
      )
      .then((response) => {
        const building: ApiBuilding = { ...response, _type: 'building' };
        const center = show(building, null);
        if (!cleabs || !center) return;
        fetchBdTopo(cleabs, center, controller.signal)
          .then((bdtopo) => {
            if (bdtopo) show(building, bdtopo);
          })
          .catch(() => {});
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setData({
          ...EMPTY,
          error:
            error instanceof Error
              ? error.message
              : 'Impossible de charger le bâtiment.',
        });
      });

    return () => controller.abort();
  }, [rnbId, cleabs]);

  return data;
}
