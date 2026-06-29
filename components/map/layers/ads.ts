import maplibregl from 'maplibre-gl';
import { getADSOperationIcons } from '@/logic/ads';

// ADS source
export const SRC_ADS = 'ads';
export const SRC_ADS_URL = `${process.env.NEXT_PUBLIC_API_BASE}/permis/tiles/{x}/{y}/{z}.pbf`;

// ADS Layers
export const LAYER_ADS_CIRCLE = 'adscircle';
export const LAYER_ADS_ICON = 'adsicon';

export const installADS = async (map: maplibregl.Map) => {
  const adsOperationsIcons = getADSOperationIcons();

  if (map.getLayer(LAYER_ADS_CIRCLE)) map.removeLayer(LAYER_ADS_CIRCLE);
  if (map.getLayer(LAYER_ADS_ICON)) map.removeLayer(LAYER_ADS_ICON);
  if (map.getSource(SRC_ADS)) map.removeSource(SRC_ADS);

  // Icons for ADS
  // build icon
  if (!map.hasImage('adsBuild')) {
    const adsBuild = await map.loadImage(adsOperationsIcons.build.src);
    map.addImage('adsBuild', adsBuild.data, { sdf: true });
  }

  // modify icon
  if (!map.hasImage('adsModify')) {
    const adsModify = await map.loadImage(adsOperationsIcons.modify.src);
    map.addImage('adsModify', adsModify.data, { sdf: true });
  }

  // demolish icon
  if (!map.hasImage('adsDemo')) {
    const adsDemo = await map.loadImage(adsOperationsIcons.demolish.src);
    map.addImage('adsDemo', adsDemo.data, { sdf: true });
  }

  map.addSource(SRC_ADS, {
    type: 'vector',
    tiles: [SRC_ADS_URL + '#' + Math.random()],
    minzoom: 16,
    maxzoom: 22,
    promoteId: 'file_number',
  });

  map.addLayer({
    id: LAYER_ADS_CIRCLE,
    source: SRC_ADS,
    'source-layer': 'default',
    type: 'circle',
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['==', ['feature-state', 'hovered'], true]],
        12,
        10,
      ],
      'circle-stroke-color': [
        'case',
        ['boolean', ['feature-state', 'highlighted'], false],
        '#431407',
        '#ffffff',
      ],
      'circle-stroke-width': 2,
      'circle-color': '#fbbf24',
    },
  });

  map.addLayer({
    id: LAYER_ADS_ICON,
    source: SRC_ADS,
    'source-layer': 'default',
    type: 'symbol',
    layout: {
      'icon-image': [
        'match',
        ['get', 'operation'],
        'build',
        'adsBuild',
        'demolish',
        'adsDemo',
        'modify',
        'adsModify',
        'adsBuild',
      ],
      'icon-size': 0.2,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-color': '#431407',
    },
  });
};
