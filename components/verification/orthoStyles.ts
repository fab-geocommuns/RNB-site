import { StyleSpecification } from 'maplibre-gl';

// Orthophotos anciennes de la Géoplateforme (celles de « Remonter le temps »).
// Chaque couche a sa grille (TILEMATRIXSET) et son format : valeurs lues dans
// le GetCapabilities du WMTS. La couverture des millésimes est partielle :
// une zone sans image reste vide.
const OLD_ORTHOS = [
  [
    '1950-1965',
    'ORTHOIMAGERY.ORTHOPHOTOS.1950-1965',
    'BDORTHOHISTORIQUE',
    'image/png',
    'PM_0_18',
  ],
  [
    '1965-1980',
    'ORTHOIMAGERY.ORTHOPHOTOS.1965-1980',
    'BDORTHOHISTORIQUE',
    'image/png',
    'PM_3_18',
  ],
  [
    '1980-1995',
    'ORTHOIMAGERY.ORTHOPHOTOS.1980-1995',
    'BDORTHOHISTORIQUE',
    'image/png',
    'PM_3_18',
  ],
  [
    '2000-2005',
    'ORTHOIMAGERY.ORTHOPHOTOS2000-2005',
    'normal',
    'image/jpeg',
    'PM_6_18',
  ],
  [
    '2006-2010',
    'ORTHOIMAGERY.ORTHOPHOTOS2006-2010',
    'normal',
    'image/jpeg',
    'PM_6_18',
  ],
  [
    '2011-2015',
    'ORTHOIMAGERY.ORTHOPHOTOS2011-2015',
    'normal',
    'image/jpeg',
    'PM_6_18',
  ],
  [
    '2016-2020',
    'ORTHOIMAGERY.ORTHOPHOTOS2016-2020',
    'normal',
    'image/jpeg',
    'PM',
  ],
  [
    '2021-2023',
    'ORTHOIMAGERY.ORTHOPHOTOS2021-2023',
    'normal',
    'image/jpeg',
    'PM_6_19',
  ],
] as const;

export type OrthoPeriod = (typeof OLD_ORTHOS)[number][0];

export const ORTHO_PERIODS: OrthoPeriod[] = OLD_ORTHOS.map(
  ([period]) => period,
);

export const DEFAULT_OLD_PERIOD: OrthoPeriod = '2011-2015';

const styleCache = new Map<OrthoPeriod, StyleSpecification>();

export function oldOrthoStyle(period: OrthoPeriod): StyleSpecification {
  const cached = styleCache.get(period);
  if (cached) return cached;
  const [, layer, style, format, matrixSet] = OLD_ORTHOS.find(
    ([p]) => p === period,
  )!;
  const spec: StyleSpecification = {
    version: 8,
    glyphs:
      'https://openmaptiles.geo.data.gouv.fr/fonts/{fontstack}/{range}.pbf',
    sources: {
      ortho: {
        type: 'raster',
        tiles: [
          `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=${style}&FORMAT=${encodeURIComponent(format)}&TILEMATRIXSET=${matrixSet}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`,
        ],
        tileSize: 256,
        maxzoom: matrixSet.endsWith('19') ? 19 : 18,
        attribution: '© IGN',
      },
    },
    layers: [{ id: 'ortho', type: 'raster', source: 'ortho' }],
  };
  styleCache.set(period, spec);
  return spec;
}
