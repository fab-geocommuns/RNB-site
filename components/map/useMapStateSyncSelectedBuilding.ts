import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  SRC_BDGS_POINTS,
  SRC_BDGS_SHAPES,
} from '@/components/map/useMapLayers';
import { RootState } from '@/stores/store';
import maplibregl from 'maplibre-gl';
import { SelectedItem } from '@/stores/map/map-slice';

/**
 * Gestion de la synchronisation entre la selection d'un item et le store Redux
 * @param map
 */
export const useMapStateSyncSelectedBuilding = (map?: maplibregl.Map) => {
  // Selected item
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const [previousSelectedItem, setPreviousSelectedItem] = useState<any>();

  const getFeatureTypeSource = (item: SelectedItem) => {
    if (item._type === 'building') {
      return [SRC_BDGS_POINTS, SRC_BDGS_SHAPES];
    }

    if (item._type === 'ads') {
      return ['ads'];
    }

    return [];
  };

  const getFeatureId = (item: SelectedItem) => {
    if (item._type === 'building') {
      return item.rnb_id;
    }

    if (item._type === 'ads') {
      return item.file_number;
    }
  };

  const selectedItemHasChanged = (
    previousSelectedItem: SelectedItem,
    selectedItem: SelectedItem,
  ) => {
    if (previousSelectedItem === undefined) return true;
    if (previousSelectedItem._type !== selectedItem._type) return true;

    if (
      selectedItem._type === 'building' &&
      previousSelectedItem._type === 'building'
    ) {
      return previousSelectedItem.rnb_id !== selectedItem.rnb_id;
    }

    if (selectedItem._type === 'ads' && previousSelectedItem._type === 'ads') {
      return previousSelectedItem.file_number !== selectedItem.file_number;
    }
  };

  // Initialisation de la synchronisation: selectedBuildingId
  useEffect(() => {
    if (
      map &&
      selectedItem &&
      selectedItemHasChanged(previousSelectedItem, selectedItem)
    ) {
      // Si on arrive sur la page avec un bâtiment pré-sélectionné (q=rnbId), il se peut que ce useEffect soit exécuté avant le chargement de la source BUILDINGS_SOURCE.
      // On ajoute donc cet événement pour palier à ce cas.
      const onSourceData = (e: any) => {
        if (
          e.isSourceLoaded &&
          [SRC_BDGS_POINTS, SRC_BDGS_SHAPES].includes(e.sourceId)
        ) {
          toggleHighlight(previousSelectedItem, selectedItem);
        }
      };
      map.on('sourcedata', (e) => onSourceData(e));
      toggleHighlight(previousSelectedItem, selectedItem);

      return () => {
        map.off('sourcedata', onSourceData);
      };
    }
  }, [selectedItem]);

  const toggleHighlight = (
    previousSelectedItem: SelectedItem,
    selectedItem: SelectedItem,
  ) => {
    // First, downlight the previous selected item
    if (previousSelectedItem && map) {
      const sources = getFeatureTypeSource(previousSelectedItem);
      const id = getFeatureId(previousSelectedItem);

      if (id) {
        for (const source of sources) {
          if (map.getSource(source)) {
            map.setFeatureState(
              {
                source,
                id,
                sourceLayer: 'default',
              },
              { in_panel: false },
            );
          }
        }
      }
    }

    // Then, highlight the current selected item

    if (selectedItem && map) {
      const sources = getFeatureTypeSource(selectedItem);
      const id = getFeatureId(selectedItem);
      if (id) {
        for (const source of sources) {
          if (map.getSource(source)) {
            map.setFeatureState(
              {
                source,
                id,
                sourceLayer: 'default',
              },
              { in_panel: true },
            );
          }
        }
      }

      // Finally, set the previous selected item
      setPreviousSelectedItem(selectedItem);
    }
  };
};
