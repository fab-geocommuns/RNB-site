import maplibregl, {
  ExpressionSpecification,
  FilterSpecification,
} from 'maplibre-gl';
import { fr } from '@codegouvfr/react-dsfr';
import reportIcon from '@/public/images/map/report.png';

export const SRC_REPORTS = 'reports';
export const LAYER_REPORTS_CIRCLE = 'reports_circle';
export const LAYER_REPORTS_ICON = 'reports_icon';
export const LAYER_REPORTS_SMALL_CIRCLES = 'report_small_circles';

export const SRC_REPORTS_URL = `${process.env.NEXT_PUBLIC_API_BASE}/reports/tiles/{x}/{y}/{z}.pbf`;

const isPending: ExpressionSpecification = ['==', ['get', 'status'], 'pending'];
const isHighlighted: ExpressionSpecification = [
  'boolean',
  ['feature-state', 'highlighted'],
  false,
];

// tag_ids arrives as Postgres array text ("{1,12}"): turned into ",1,12," so a tag id matches exactly
const delimitedTagIds: ExpressionSpecification = [
  'concat',
  ',',
  ['slice', ['get', 'tag_ids'], 1, ['-', ['length', ['get', 'tag_ids']], 1]],
  ',',
];

const CLOSED_REPORT_OPACITY = 0.6;

// The selected report keeps its full style whatever its status
const byReportStatus = ({
  pending,
  closed,
}: {
  pending: number | string;
  closed: number | string;
}): ExpressionSpecification => [
  'case',
  isHighlighted,
  pending,
  isPending,
  pending,
  closed,
];

const reportOpacity = byReportStatus({
  pending: 1,
  closed: CLOSED_REPORT_OPACITY,
});

export const getDefaultReportFilter = () => {
  const defaultReportFilter: FilterSpecification = [
    '==',
    'pending',
    ['get', 'status'],
  ];

  return defaultReportFilter;
};

type ReportFilterParams = {
  displayedTags: 'all' | number[];
  showClosedReports: boolean;
  selectedReportId?: number | null;
};

const buildReportFilter = ({
  displayedTags,
  showClosedReports,
  selectedReportId,
}: ReportFilterParams): ExpressionSpecification => {
  const conditions: ExpressionSpecification[] = [];
  if (!showClosedReports) conditions.push(isPending);
  if (displayedTags !== 'all') {
    conditions.push([
      'any',
      ...displayedTags.map(
        (tagId): ExpressionSpecification => [
          'in',
          `,${tagId},`,
          delimitedTagIds,
        ],
      ),
    ]);
  }
  const filter: ExpressionSpecification = ['all', ...conditions];

  // The selected report stays visible even when the filters exclude it
  if (!selectedReportId) return filter;
  return ['any', ['==', ['get', 'id'], selectedReportId], filter];
};

export function setDisplayedReportFilters({
  map,
  ...filterParams
}: { map: maplibregl.Map } & ReportFilterParams) {
  const reportLayersSetup = [
    LAYER_REPORTS_CIRCLE,
    LAYER_REPORTS_ICON,
    LAYER_REPORTS_SMALL_CIRCLES,
  ].every((layer) => map?.getLayer(layer));
  if (!reportLayersSetup) return;

  const filter = buildReportFilter(filterParams);
  map.setFilter(LAYER_REPORTS_CIRCLE, filter);
  map.setFilter(LAYER_REPORTS_ICON, filter);
  map.setFilter(LAYER_REPORTS_SMALL_CIRCLES, filter);
}

export const installReports = async ({
  map,
  displayedTags,
  showClosedReports,
}: {
  map: maplibregl.Map;
  displayedTags: 'all' | number[];
  showClosedReports: boolean;
}) => {
  const darkColor = '#d64d00';
  const lightColor = '#fcf5f4';
  const closedColor = fr.colors.getHex({ isDark: false }).options.grey._625_425
    .default;

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
      'circle-color': byReportStatus({
        pending: darkColor,
        closed: closedColor,
      }),
      'circle-opacity': reportOpacity,

      'circle-stroke-color': lightColor,
      'circle-stroke-width': 3,
      'circle-stroke-opacity': reportOpacity,
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
      'circle-stroke-opacity': reportOpacity,
      'circle-opacity': reportOpacity,
      'circle-color': ['case', isHighlighted, darkColor, lightColor],
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
      'icon-opacity': reportOpacity,
      'icon-color': [
        'case',
        isHighlighted,
        lightColor,
        isPending,
        darkColor,
        closedColor,
      ],
    },
  });

  setDisplayedReportFilters({ map, displayedTags, showClosedReports });
};
