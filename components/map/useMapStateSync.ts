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
 * Gestion de la synchronisation entre la carte et le store Redux
 * @param map
 */
export const useMapStateSync = (map?: maplibregl.Map) => {
  const stateMoveTo = useSelector((state: RootState) => state.map.moveTo);

  // Address marker
  const marker = useSelector((state: RootState) => state.map.marker);
  const [currentMarker, setCurrentMarker] = useState<maplibregl.Marker>();

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

  // Initialisation de la synchronisation: moveTo
  useEffect(() => {
    if (
      stateMoveTo &&
      stateMoveTo.lat &&
      stateMoveTo.lng &&
      stateMoveTo.zoom &&
      stateMoveTo.fromMapEvent !== true &&
      map
    ) {
      const fn = stateMoveTo.fly ? 'flyTo' : 'jumpTo';
      map[fn]({
        center: [stateMoveTo.lng, stateMoveTo.lat],
        zoom: stateMoveTo.zoom,
      });
    }
  }, [map, stateMoveTo]);

  // Initialisation de la synchronisation: marker
  useEffect(() => {
    if (map) {
      if (currentMarker) {
        if (marker) {
          currentMarker.setLngLat(marker);
        } else {
          currentMarker.remove();
          setCurrentMarker(undefined);
        }
      } else if (marker) {
        const newMarker = new maplibregl.Marker({
          color: '#1452e3',
          draggable: false,
        }).setLngLat(marker);

        newMarker.addTo(map);
        setCurrentMarker(newMarker);
      }
    }
  }, [marker, map]);

  // Initialisation de la synchronisation: selectedBuildingId
  useEffect(() => {
    const toggleHighlight = () => {
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

    if (map) {
      // Si on arrive sur la page avec un bâtiment pré-sélectionné (q=rnbId), il se peut que ce useEffect soit exécuté avant le chargement de la source BUILDINGS_SOURCE.
      // On ajoute donc cet événement pour palier à ce cas.
      map.on('sourcedata', (e) => {
        if (
          e.isSourceLoaded &&
          [SRC_BDGS_POINTS, SRC_BDGS_SHAPES].includes(e.sourceId)
        ) {
          toggleHighlight();
        }
      });

      toggleHighlight();
    }
  }, [selectedItem, previousSelectedItem, map]);
};
