import maplibregl from 'maplibre-gl';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useEffect, useRef } from 'react';
import {
  TerraDraw,
  TerraDrawMapLibreGLAdapter,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from 'terra-draw';
import { MultiPolygon, Polygon } from 'geojson';

const CURRENT_DRAW_ID_PREFIX = 'current_';

export const useMapDraw = (map?: maplibregl.Map) => {
  const drawRef = useRef<TerraDraw>();
  const dispatch: AppDispatch = useDispatch();

  const { shape, rnb_id } = useSelector(
    (state: RootState) => state.contribution,
  );

  useEffect(() => {
    if (map) {
      drawRef.current = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({ map }),
        modes: [
          new TerraDrawPolygonMode(),
          new TerraDrawSelectMode({
            allowManualDeselection: false,
            flags: {
              select: {
                feature: {
                  draggable: true,
                  coordinates: {
                    midpoints: true,
                    draggable: true,
                    deletable: true,
                  },
                },
              },
            },
          }),
        ],
        idStrategy: {
          isValidId: (id) => typeof id === 'string',
          getId: () => (Math.random() + 1).toString(36).substring(2),
        },
      });

      drawRef.current.on('change', (ids, type) => {
        if (!ids.some((id) => id.toString().startsWith(CURRENT_DRAW_ID_PREFIX)))
          return;

        const snapshot = drawRef.current!.getSnapshot();
        const polygonFeatures = snapshot.filter((feature) =>
          feature.id?.toString().startsWith(CURRENT_DRAW_ID_PREFIX),
        );

        if (polygonFeatures.length === 1) {
          dispatch(Actions.contribution.setShape(polygonFeatures[0].geometry));
        } else if (polygonFeatures.length > 1) {
          dispatch(
            Actions.contribution.setShape({
              type: 'MultiPolygon',
              coordinates: polygonFeatures.map(
                (p) => p.geometry.coordinates as Polygon['coordinates'],
              ),
            } satisfies MultiPolygon),
          );
        }
      });

      drawRef.current.start();
    }

    return () => {
      drawRef.current?.clear();
      drawRef.current?.stop();
    };
  }, [map]);

  useEffect(() => {
    if (!drawRef.current) return;

    drawRef.current.clear();

    if (shape) {
      const polygonCoordinates: Polygon['coordinates'][] = [];
      switch (shape.type) {
        case 'MultiPolygon':
          polygonCoordinates.push(...shape.coordinates);
          break;
        case 'Polygon':
          polygonCoordinates.push(shape.coordinates);
          break;
        case 'Point':
          break;
      }
      console.log(shape, polygonCoordinates);

      if (polygonCoordinates.length > 0) {
        drawRef.current.addFeatures(
          polygonCoordinates.map((coordinates, index) => ({
            id: CURRENT_DRAW_ID_PREFIX + index,
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates,
            },
            properties: {
              mode: 'select',
            },
          })),
        );

        drawRef.current.selectFeature(CURRENT_DRAW_ID_PREFIX + '0');
      }
    }
  }, [rnb_id]);
};
