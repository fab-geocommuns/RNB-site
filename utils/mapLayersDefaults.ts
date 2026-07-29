import { getArrayQueryParam, getQueryParam } from '@/utils/queryParams';
// @ts-ignore
import Cookies from 'js-cookie';
import {
  MapBackgroundLayer,
  MapBuildingsLayer,
  MapExtraLayer,
  isValidExtraLayer,
} from '@/stores/map/map-slice';

export const MAP_LAYERS_COOKIE_KEY = 'rnb_map_layers';
export const MAP_LAYERS_EDITION_COOKIE_KEY = 'rnb_map-layers_edition';

export type SavedLayers = {
  background?: MapBackgroundLayer;
  buildings?: MapBuildingsLayer;
  extraLayers?: MapExtraLayer[];
};

const VALID_BACKGROUNDS: MapBackgroundLayer[] = [
  'vectorIgnStandard',
  'vectorOsm',
  'satellite',
  'satellite_2016_2020',
];
const VALID_BUILDINGS: MapBuildingsLayer[] = ['point', 'polygon'];

function getSavedLayers(cookieKey: string): SavedLayers {
  const raw = Cookies.get(cookieKey);
  if (!raw) return {};
  try {
    const savedLayers = JSON.parse(raw);
    if (!savedLayers) return {};
    return savedLayers;
  } catch {
    return {};
  }
}

export function getDefaultMapLayers(
  fallbacks: {
    background: MapBackgroundLayer;
    buildings: MapBuildingsLayer;
    extraLayers: MapExtraLayer[];
  },
  cookieKey: string = MAP_LAYERS_COOKIE_KEY,
): Required<SavedLayers> {
  const saved = getSavedLayers(cookieKey);

  const fromUrlBackground = getQueryParam(
    'bg_layer',
  ) as MapBackgroundLayer | null;
  const background =
    (fromUrlBackground &&
      VALID_BACKGROUNDS.includes(fromUrlBackground) &&
      fromUrlBackground) ||
    (saved.background &&
      VALID_BACKGROUNDS.includes(saved.background) &&
      saved.background) ||
    fallbacks.background;

  const fromUrlBuildings = getQueryParam(
    'bdg_layer',
  ) as MapBuildingsLayer | null;
  const buildings =
    (fromUrlBuildings &&
      VALID_BUILDINGS.includes(fromUrlBuildings) &&
      fromUrlBuildings) ||
    (saved.buildings &&
      VALID_BUILDINGS.includes(saved.buildings) &&
      saved.buildings) ||
    fallbacks.buildings;

  const fromUrlExtraLayers = getArrayQueryParam<MapExtraLayer>(
    'extra_layers',
    (value) => value as MapExtraLayer,
    isValidExtraLayer,
  );

  const extraLayers =
    fromUrlExtraLayers !== null
      ? fromUrlExtraLayers
      : saved.extraLayers && saved.extraLayers.every(isValidExtraLayer)
        ? saved.extraLayers
        : fallbacks.extraLayers;

  return { background, buildings, extraLayers };
}

export function saveMapLayersPreference(
  layers: SavedLayers,
  cookieKey: string = MAP_LAYERS_COOKIE_KEY,
) {
  Cookies.set(cookieKey, JSON.stringify(layers), {
    expires: 365,
    path: '/',
    sameSite: 'Lax',
  });
}
