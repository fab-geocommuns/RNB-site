import maplibregl from 'maplibre-gl';

// Plots
export const LAYER_PLOTS_SHAPE = 'plots_shape';
export const LAYER_PLOTS_TXT = 'plots_txt';
export const SRC_PLOTS = 'plotstiles';

export const installPlots = (map: maplibregl.Map) => {
  if (map.getLayer(LAYER_PLOTS_SHAPE)) map.removeLayer(LAYER_PLOTS_SHAPE);
  if (map.getLayer(LAYER_PLOTS_TXT)) map.removeLayer(LAYER_PLOTS_TXT);
  if (map.getSource(SRC_PLOTS)) map.removeSource(SRC_PLOTS);

  map.addSource(SRC_PLOTS, {
    type: 'vector',
    tiles: [process.env.NEXT_PUBLIC_API_BASE + '/plots/tiles/{x}/{y}/{z}.pbf'],
    minzoom: 16,
    maxzoom: 22,
    promoteId: 'id',
  });

  map.addLayer({
    id: LAYER_PLOTS_SHAPE,
    source: SRC_PLOTS,
    'source-layer': 'default',
    type: 'line',
    paint: {
      'line-color': '#ea580c',
      'line-opacity': 0.9,
      'line-width': 2,
    },
  });

  // Display the plot id in the middle of the plot
  map.addLayer({
    id: LAYER_PLOTS_TXT,
    source: SRC_PLOTS,
    'source-layer': 'default',
    type: 'symbol',
    layout: {
      'text-field': ['get', 'plot_number'],
      'text-size': 12,
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-offset': [0, 0],
      'text-anchor': 'center',
      'text-allow-overlap': false,
    },
    paint: {
      'text-color': '#ea580c',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1,
    },
  });
};
