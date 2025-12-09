import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { getNearestFeatureFromCursorWithBuffer } from '@/components/map/map.utils';
import { MapMouseEvent } from 'maplibre-gl';
import {
  LAYER_BDGS_POINT,
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_SHAPE_POINT,
  SRC_BDGS_SHAPES,
  LAYER_BAN_POINT,
  LAYER_BAN_TXT,
  LAYER_REPORTS_CIRCLE,
  LAYER_REPORTS_ICON,
} from '@/components/map/useMapLayers';
import { selectBuildingsAndSetMergeCandidates } from '@/stores/edition/edition-slice';
import { selectBuildingAndSetOperationUpdate } from '@/stores/edition/edition-slice';
import {
  toasterError,
  toasterSuccess,
} from '@/components/contribution/toaster';
import { displayBANPopup } from './BanLayerEvent';
import { useRNBFetch } from '@/utils/use-rnb-fetch';

/**
 * Ajout et gestion des événements de la carte
 * @param map
 */
export const useEditionMapEvents = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();
  const previousHoveredFeatureId = useRef<string | undefined>(undefined);
  const previousHoveredFeatureSource = useRef<string | undefined>(undefined);
  const previousSplitCandidate = useRef<string | undefined>(undefined);
  const shapeInteractionMode = useSelector(
    (state: RootState) => state.edition.updateCreate.shapeInteractionMode,
  );
  const operation = useSelector((state: RootState) => state.edition.operation);
  const splitCandidateId = useSelector(
    (state: RootState) => state.edition.split.splitCandidateId,
  );
  const selectedBuildingRnbId = useSelector((state: RootState) =>
    state.map.selectedItem?._type === 'building'
      ? state.map.selectedItem.rnb_id
      : null,
  );
  const buildingNewShape = useSelector(
    (state: RootState) => state.edition.updateCreate.buildingNewShape,
  );
  const clickOutCount = useRef(0);
  const [quickAddressLink, setQuickAddressLink] = useState<{
    ban: string | null;
    rnb_id: string | null;
  }>({
    ban: null,
    rnb_id: null,
  });
  const { fetch } = useRNBFetch();

  const resetQuickAddressLink = () => {
    setQuickAddressLink({ ban: null, rnb_id: null });
  };

  useEffect(() => {
    if (quickAddressLink.ban && quickAddressLink.rnb_id) {
      const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${quickAddressLink.rnb_id}/`;
      let data: { [key: string]: any } = {
        addresses_cle_interop: [quickAddressLink.ban],
      };
      fetch(url, {
        body: JSON.stringify(data),
        method: 'PATCH',
      }).then((response) => {
        if (!response.ok) {
          toasterError(dispatch, `Erreur lors de la mise à jour de l'adresse`);
        } else {
          toasterSuccess(dispatch, `Adresse mise à jour ✉️`);
          dispatch(
            selectBuildingAndSetOperationUpdate(quickAddressLink.rnb_id),
          );
        }
      });
      resetQuickAddressLink();
    }
  }, [quickAddressLink, dispatch, fetch]);

  // Initialisation des événements
  useEffect(() => {
    if (map) {
      // Click sur la carte
      const handleClickEvent = (e: MapMouseEvent) => {
        const featureOnCursor = getNearestFeatureFromCursorWithBuffer(
          map,
          e,
          0,
        );
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map,
          e,
          5,
        );

        const rnbIdClickedOn = featureOnCursor
          ? featureOnCursor.properties.rnb_id
          : undefined;
        const rnbIdClickedClose = featureCloseToCursor
          ? featureCloseToCursor.properties.rnb_id
          : undefined;

        if (e.originalEvent.shiftKey) {
          if (
            [LAYER_BAN_POINT, LAYER_BAN_TXT].includes(featureOnCursor.layer.id)
          ) {
            setQuickAddressLink((prev) => ({
              ...prev,
              ban: featureOnCursor.id,
            }));
          } else if (rnbIdClickedOn) {
            setQuickAddressLink((prev) => ({
              ...prev,
              rnb_id: rnbIdClickedClose,
            }));
          } else {
            resetQuickAddressLink();
          }
        } else {
          resetQuickAddressLink();
        }

        // This part below, about BAN and reports, is a duplicate of the one in useVisuMapEvents
        // We should probably refactor it to avoid code duplication
        if (featureOnCursor) {
          if (
            [LAYER_BAN_POINT, LAYER_BAN_TXT].includes(featureOnCursor.layer.id)
          ) {
            displayBANPopup(map, featureCloseToCursor);
          }

          if (
            [LAYER_REPORTS_CIRCLE, LAYER_REPORTS_ICON].includes(
              featureOnCursor.layer.id,
            )
          ) {
            const reportId = featureOnCursor.id as number | null;
            dispatch(Actions.report.selectReport(reportId));
          }
        }

        if (operation === 'update' || operation === null) {
          if (shapeInteractionMode !== 'drawing') {
            if (buildingNewShape !== null) {
              // avoid loosing ongoing shape edition on click out
              clickOutCount.current = clickOutCount.current + 1;
              if (clickOutCount.current > 2) {
                clickOutCount.current = 0;
                toasterSuccess(
                  dispatch,
                  `Pour sélectionner un autre bâtiment, annulez la modification en cours`,
                );
              }
            } else if (
              featureOnCursor &&
              rnbIdClickedOn !== selectedBuildingRnbId
            ) {
              // What did we click on?
              if (
                [
                  LAYER_BDGS_POINT,
                  LAYER_BDGS_SHAPE_BORDER,
                  LAYER_BDGS_SHAPE_POINT,
                ].includes(featureOnCursor.layer.id)
              ) {
                dispatch(selectBuildingAndSetOperationUpdate(rnbIdClickedOn));
              }
            } else if (
              featureOnCursor === undefined &&
              rnbIdClickedClose !== selectedBuildingRnbId
            ) {
              // click out unselects the currently selected item, unless the click is very close to the currently edited building
              dispatch(Actions.edition.setOperation(null));
            }
          }
        } else if (operation === 'split' && splitCandidateId === null) {
          if (featureOnCursor) {
            // What did we click on?
            if (
              [
                LAYER_BDGS_POINT,
                LAYER_BDGS_SHAPE_BORDER,
                LAYER_BDGS_SHAPE_POINT,
              ].includes(featureOnCursor.layer.id)
            ) {
              const rnb_id = featureOnCursor.properties.rnb_id;
              dispatch(
                Actions.edition.setSplitCandidateAndLocation({
                  rnb_id: rnb_id,
                  location: [e.lngLat.lng, e.lngLat.lat],
                }),
              );
            }
          }
        } else if (operation === 'merge') {
          if (featureOnCursor) {
            dispatch(
              selectBuildingsAndSetMergeCandidates(
                featureOnCursor.properties.rnb_id,
              ),
            );
          }
        }
      };

      map.on('click', handleClickEvent);

      /////////////
      const handleMouseMove = (e: MapMouseEvent) => {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map!,
          e,
          0,
        );

        if (shapeInteractionMode === 'drawing') {
          map!.getCanvas().style.cursor = 'crosshair';
        } else if (featureCloseToCursor) {
          map!.getCanvas().style.cursor = 'pointer';
        } else {
          map!.getCanvas().style.cursor = '';
        }

        if (
          previousHoveredFeatureId.current &&
          previousHoveredFeatureSource.current
        ) {
          map.setFeatureState(
            {
              source: previousHoveredFeatureSource.current,
              id: previousHoveredFeatureId.current,
              sourceLayer: 'default',
            },
            { hovered: false },
          );
        }

        if (featureCloseToCursor && operation === null) {
          map.setFeatureState(
            {
              source: featureCloseToCursor.layer.source,
              id: featureCloseToCursor?.id,
              sourceLayer: 'default',
            },
            { hovered: true },
          );

          previousHoveredFeatureId.current = featureCloseToCursor?.id as string;
          previousHoveredFeatureSource.current = featureCloseToCursor?.layer
            .source as string;
        }
      };
      // Évenement de déplacement du curseur: changement de pointeur si proche d'un bâtiment
      map.on('mousemove', handleMouseMove);

      return () => {
        map.off('click', handleClickEvent);
        map.off('mousemove', handleMouseMove);
      };
    }
  }, [
    dispatch,
    map,
    shapeInteractionMode,
    operation,
    selectedBuildingRnbId,
    buildingNewShape,
  ]);

  // split candidate highlighting
  useEffect(() => {
    if (map) {
      if (previousSplitCandidate.current) {
        map.removeFeatureState({
          source: SRC_BDGS_SHAPES,
          sourceLayer: 'default',
          id: previousSplitCandidate.current,
        });
        previousSplitCandidate.current = undefined;
      }

      if (operation === 'split' && splitCandidateId) {
        map.setFeatureState(
          {
            source: SRC_BDGS_SHAPES,
            id: splitCandidateId,
            sourceLayer: 'default',
          },
          { in_panel: true },
        );
        previousSplitCandidate.current = splitCandidateId;
      }
    }
  }, [map, splitCandidateId, operation]);
};
