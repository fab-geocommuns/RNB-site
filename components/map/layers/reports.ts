import maplibregl, {
  ExpressionSpecification,
  MapGeoJSONFeature,
} from 'maplibre-gl';
import { fr } from '@codegouvfr/react-dsfr';
import reportIcon from '@/public/images/map/report.png';
import type { ReportStatus } from '@/types/report';

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

// Draw priority in a stack of reports: the higher value is drawn on top
enum ReportDrawPriority {
  Selected = 2,
  Pending = 1,
  Closed = 0,
}

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

  // A higher sort key is drawn above, for circles as for overlapping symbols
  const drawPriority: ExpressionSpecification = [
    'case',
    ['==', ['get', 'id'], filterParams.selectedReportId ?? -1],
    ReportDrawPriority.Selected,
    isPending,
    ReportDrawPriority.Pending,
    ReportDrawPriority.Closed,
  ];
  map.setLayoutProperty(LAYER_REPORTS_CIRCLE, 'circle-sort-key', drawPriority);
  map.setLayoutProperty(LAYER_REPORTS_ICON, 'symbol-sort-key', drawPriority);
  map.setLayoutProperty(
    LAYER_REPORTS_SMALL_CIRCLES,
    'circle-sort-key',
    drawPriority,
  );
}

export const getReportDrawPriority = (report: MapGeoJSONFeature) => {
  if (report.state.highlighted) return ReportDrawPriority.Selected;
  if (report.properties.status === 'pending') return ReportDrawPriority.Pending;
  return ReportDrawPriority.Closed;
};

// Ids of the displayed reports sharing the report's point: open ones first, then closed, oldest (smallest id) first
export const getReportIdsAtPoint = ({
  map,
  report,
}: {
  map: maplibregl.Map;
  report: MapGeoJSONFeature;
}): number[] => {
  if (report.geometry.type !== 'Point') return [report.id as number];

  const [lng, lat] = report.geometry.coordinates;
  const stackedReports = map
    .queryRenderedFeatures(map.project([lng, lat]), {
      layers: [LAYER_REPORTS_CIRCLE],
    })
    .filter(
      ({ geometry }) =>
        geometry.type === 'Point' &&
        geometry.coordinates[0] === lng &&
        geometry.coordinates[1] === lat,
    );

  // A report spanning several tiles is returned once per tile
  const statusById = new Map(
    [report, ...stackedReports].map(({ id, properties }) => [
      id as number,
      properties.status as ReportStatus,
    ]),
  );
  const isClosed = (id: number) => Number(statusById.get(id) !== 'pending');
  // Tiles carry no creation date: report ids are a Postgres identity, a lower id is an older report
  return Array.from(statusById.keys()).sort(
    (a, b) => isClosed(a) - isClosed(b) || a - b,
  );
};

export const installReports = async (map: maplibregl.Map) => {
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
    filter: isPending,
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
    filter: isPending,
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
    filter: isPending,
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
};
