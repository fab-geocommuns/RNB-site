import maplibregl, { FilterSpecification } from 'maplibre-gl';
import reportIcon from '@/public/images/map/report.png';

export const SRC_REPORTS = 'reports';
export const LAYER_REPORTS_CIRCLE = 'reports_circle';
export const LAYER_REPORTS_ICON = 'reports_icon';
export const LAYER_REPORTS_SMALL_CIRCLES = 'report_small_circles';

export const SRC_REPORTS_URL = `${process.env.NEXT_PUBLIC_API_BASE}/reports/tiles/{x}/{y}/{z}.pbf`;

export const getDefaultReportFilter = () => {
  const defaultReportFilter: FilterSpecification = [
    '==',
    'pending',
    ['get', 'status'],
  ];

  return defaultReportFilter;
};

export function setDisplayedReportFilters(
  map: maplibregl.Map,
  displayedTags: 'all' | number[],
  selectedReportId?: number,
) {
  const reportLayersSetup = [
    LAYER_REPORTS_CIRCLE,
    LAYER_REPORTS_ICON,
    LAYER_REPORTS_SMALL_CIRCLES,
  ].every((layer) => map?.getLayer(layer));
  if (!reportLayersSetup) return;
  // We want to show only some reports given by vector tiles.
  // We can either show the selected report, or the pending reports with the right tags.
  let filters = ['any'] as any;

  // First possibility: a report is selected
  if (selectedReportId) {
    filters.push(['==', ['get', 'id'], selectedReportId]);
  }

  // Second possibility: we want to show pending reports with the right tags
  let catFilter = ['all', ['==', ['get', 'status'], 'pending']];
  if (displayedTags !== 'all') {
    let tagFilters = ['any'] as any;

    displayedTags.forEach((tagId: number) => {
      const singleTagFilter = ['in', tagId.toString(), ['get', 'tag_ids']];
      tagFilters.push(singleTagFilter);
    });

    catFilter.push(tagFilters);
  }

  filters.push(catFilter);

  map?.setFilter(LAYER_REPORTS_CIRCLE, filters);
  map?.setFilter(LAYER_REPORTS_ICON, filters);
  map?.setFilter(LAYER_REPORTS_SMALL_CIRCLES, filters);
}

export const installReports = async (
  map: maplibregl.Map,
  displayedReportTags: 'all' | number[],
) => {
  const darkColor = '#d64d00';
  const lightColor = '#fcf5f4';

  const zoomThreshold = 13;

  if (map.getLayer(LAYER_REPORTS_CIRCLE)) map.removeLayer(LAYER_REPORTS_CIRCLE);
  if (map.getLayer(LAYER_REPORTS_ICON)) map.removeLayer(LAYER_REPORTS_ICON);
  if (map.getSource(SRC_REPORTS)) map.removeSource(SRC_REPORTS);

  // add the icon if necessary
  if (!map.hasImage('reportIcon')) {
    const reportIconImg = await map.loadImage(reportIcon.src);
    map.addImage('reportIcon', reportIconImg.data, { sdf: true });
  }

  map.addSource(SRC_REPORTS, {
    type: 'vector',
    tiles: [SRC_REPORTS_URL + '#' + Math.random()],
    promoteId: 'id',
  });

  map.addLayer({
    id: LAYER_REPORTS_SMALL_CIRCLES,
    source: SRC_REPORTS,
    'source-layer': 'default',
    filter: getDefaultReportFilter(),
    maxzoom: zoomThreshold,
    type: 'circle',
    paint: {
      'circle-radius': 4,
      'circle-color': darkColor,

      'circle-stroke-color': lightColor,
      'circle-stroke-width': 3,
      'circle-stroke-opacity': 1,
    },
  });

  map.addLayer({
    id: LAYER_REPORTS_CIRCLE,
    type: 'circle',
    source: SRC_REPORTS,
    'source-layer': 'default',
    filter: getDefaultReportFilter(),
    minzoom: zoomThreshold,
    paint: {
      'circle-radius': 15,
      'circle-stroke-color': [
        'case',
        ['boolean', ['==', ['feature-state', 'hovered'], true]],
        darkColor,
        '#ffffff',
      ],
      'circle-stroke-width': 2,
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'highlighted'], false],
        darkColor,
        lightColor,
      ],
    },
  });

  map.addLayer({
    id: LAYER_REPORTS_ICON,
    source: SRC_REPORTS,
    'source-layer': 'default',
    type: 'symbol',
    filter: getDefaultReportFilter(),
    minzoom: zoomThreshold,

    layout: {
      'icon-image': 'reportIcon',
      'icon-size': 0.8,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-color': [
        'case',
        ['boolean', ['feature-state', 'highlighted'], false],
        lightColor,
        darkColor,
      ],
    },
  });

  setDisplayedReportFilters(map, displayedReportTags);
};
