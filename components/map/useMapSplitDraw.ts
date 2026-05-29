import { useEffect, useRef, type RefObject } from 'react';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useSelector, useDispatch } from 'react-redux';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Feature } from 'geojson';

/**
 * Gère le dessin des lignes de coupe pour l'opération `split`.
 *
 * Hook orthogonal à `useMapEditBuildingShape` (édition/création de forme) :
 * il ne s'active que lorsque `operation === 'split'`. Les deux partagent le
 * `drawRef` installé par `useMapDraw`.
 */
export const useMapSplitDraw = (
  map: maplibregl.Map | undefined,
  drawRef: RefObject<MapboxDraw | null>,
) => {
  const operation = useSelector((state: RootState) => state.edition.operation);
  const cutStep = useSelector(
    (state: RootState) => state.edition.split.cutStep,
  );
  const candidateShape = useSelector(
    (state: RootState) => state.edition.split.candidateShape,
  );
  const cutLines = useSelector(
    (state: RootState) => state.edition.split.cutLines,
  );
  const dispatch: AppDispatch = useDispatch();

  const prevOperationRef = useRef<string | null>(null);
  const prevCutLinesLengthRef = useRef(0);

  // a cut line was created → store it and keep drawing more lines
  useEffect(() => {
    if (map) {
      const handleCutLineCreate = (e: { features: Array<Feature> }) => {
        if (operation !== 'split') return;
        // The created feature is a LineString (cut line)
        dispatch(
          Actions.edition.addCutLine({
            geometry: e.features[0].geometry,
            featureId: e.features[0].id,
          }),
        );
        // Stay in draw_line_string mode to allow drawing more cut lines
        setTimeout(() => {
          if (drawRef.current) {
            drawRef.current.changeMode('draw_line_string');
          }
        });
      };
      drawRef.current && map.on('draw.create', handleCutLineCreate);

      return () => {
        map.off('draw.create', handleCutLineCreate);
      };
    }
  }, [map, operation]);

  // manage the draw mode based on cutStep while splitting
  useEffect(() => {
    if (operation === 'split' && drawRef.current) {
      if (cutStep === 'drawing' && candidateShape) {
        drawRef.current.changeMode('draw_line_string');
      } else {
        drawRef.current.changeMode('simple_select');
      }
    }
  }, [operation, cutStep, candidateShape]);

  // clear all draw features when entering or leaving the split operation
  useEffect(() => {
    if (
      drawRef.current &&
      (operation === 'split' || prevOperationRef.current === 'split')
    ) {
      drawRef.current.deleteAll();
    }
    prevOperationRef.current = operation;
  }, [operation]);

  // When cutLines are cleared or the last one removed, sync draw features
  useEffect(() => {
    if (operation === 'split' && drawRef.current) {
      if (cutLines.length < prevCutLinesLengthRef.current) {
        // Lines were removed — rebuild the draw features from state
        drawRef.current.deleteAll();
        for (const line of cutLines) {
          drawRef.current.add({
            type: 'Feature',
            properties: {},
            geometry: line.geometry,
          });
        }
        // Re-enter draw mode
        if (cutStep === 'drawing' && candidateShape) {
          drawRef.current.changeMode('draw_line_string');
        }
      }
      prevCutLinesLengthRef.current = cutLines.length;
    }
  }, [cutLines, operation, cutStep, candidateShape]);
};
