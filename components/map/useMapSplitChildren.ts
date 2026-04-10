import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import maplibregl from 'maplibre-gl';
import { RootState } from '@/stores/store';
import { pointOnFeature } from '@turf/turf';
import type { Feature, Polygon } from 'geojson';

export const SRC_SPLIT_CHILDREN = 'split_children';
export const LAYER_SPLIT_CHILDREN_FILL = 'split_children_fill';
export const LAYER_SPLIT_CHILDREN_BORDER = 'split_children_border';
export const LAYER_SPLIT_CHILDREN_LABEL = 'split_children_label';

const SELECTED_COLOR = '#31e060';
const UNSELECTED_COLOR = '#6a14e3';

/**
 * Display split children polygons on the map, highlighting the one
 * currently being edited so the user knows which sub-polygon they're
 * entering info for.
 */
export const useMapSplitChildren = (map?: maplibregl.Map) => {
  const operation = useSelector((state: RootState) => state.edition.operation);
  const children = useSelector(
    (state: RootState) => state.edition.split.children,
  );
  const selectedChildIndex = useSelector(
    (state: RootState) => state.edition.split.selectedChildIndex,
  );

  useEffect(() => {
    if (!map) return;

    const shouldDisplay = operation === 'split' && children.length > 0;

    // Build the feature collection as two separate features per child:
    // one Polygon for fill/border, one Point for the label.
    const fc: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: shouldDisplay
        ? children.flatMap((child, index) => {
            const polygonFeature: Feature<Polygon> = {
              type: 'Feature',
              properties: {},
              geometry: child.shape as Polygon,
            };
            const labelPoint = pointOnFeature(polygonFeature);
            return [
              {
                type: 'Feature',
                properties: {
                  index,
                  selected: selectedChildIndex === index,
                  kind: 'polygon',
                },
                geometry: child.shape,
              } as GeoJSON.Feature,
              {
                type: 'Feature',
                properties: {
                  index,
                  selected: selectedChildIndex === index,
                  kind: 'label',
                  label: String(index + 1),
                },
                geometry: labelPoint.geometry,
              } as GeoJSON.Feature,
            ];
          })
        : [],
    };

    const existingSource = map.getSource(SRC_SPLIT_CHILDREN) as
      | maplibregl.GeoJSONSource
      | undefined;

    if (existingSource) {
      existingSource.setData(fc);
    } else if (shouldDisplay) {
      map.addSource(SRC_SPLIT_CHILDREN, {
        type: 'geojson',
        data: fc,
      });

      map.addLayer({
        id: LAYER_SPLIT_CHILDREN_FILL,
        type: 'fill',
        source: SRC_SPLIT_CHILDREN,
        filter: ['==', ['get', 'kind'], 'polygon'],
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['get', 'selected'], false],
            SELECTED_COLOR,
            UNSELECTED_COLOR,
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['get', 'selected'], false],
            0.35,
            0.15,
          ],
        },
      });

      map.addLayer({
        id: LAYER_SPLIT_CHILDREN_BORDER,
        type: 'line',
        source: SRC_SPLIT_CHILDREN,
        filter: ['==', ['get', 'kind'], 'polygon'],
        paint: {
          'line-color': [
            'case',
            ['boolean', ['get', 'selected'], false],
            SELECTED_COLOR,
            UNSELECTED_COLOR,
          ],
          'line-width': [
            'case',
            ['boolean', ['get', 'selected'], false],
            3,
            1.5,
          ],
        },
      });

      map.addLayer({
        id: LAYER_SPLIT_CHILDREN_LABEL,
        type: 'symbol',
        source: SRC_SPLIT_CHILDREN,
        filter: ['==', ['get', 'kind'], 'label'],
        layout: {
          'text-field': ['get', 'label'],
          'text-size': 18,
          'text-font': ['Noto Sans Bold'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': [
            'case',
            ['boolean', ['get', 'selected'], false],
            SELECTED_COLOR,
            UNSELECTED_COLOR,
          ],
          'text-halo-width': 3,
        },
      });
    }

    if (!shouldDisplay && existingSource) {
      if (map.getLayer(LAYER_SPLIT_CHILDREN_LABEL))
        map.removeLayer(LAYER_SPLIT_CHILDREN_LABEL);
      if (map.getLayer(LAYER_SPLIT_CHILDREN_BORDER))
        map.removeLayer(LAYER_SPLIT_CHILDREN_BORDER);
      if (map.getLayer(LAYER_SPLIT_CHILDREN_FILL))
        map.removeLayer(LAYER_SPLIT_CHILDREN_FILL);
      map.removeSource(SRC_SPLIT_CHILDREN);
    }
  }, [map, operation, children, selectedChildIndex]);
};
