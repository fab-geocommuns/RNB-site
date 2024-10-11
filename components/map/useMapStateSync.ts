import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BUILDINGS_SOURCE } from '@/components/map/useMapLayers';
import { RootState } from '@/stores/map/store';
import maplibregl from 'maplibre-gl';

/**
 * Gestion de la synchronisation entre la carte et le store Redux
 * @param map
 */
export const useMapStateSync = (map?: maplibregl.Map) => {
  const stateMoveTo = useSelector((state: RootState) => state.moveTo);

  const selectedBuildingId = useSelector((state: RootState) => {
    if (state.selectedItemType === 'building') {
      return state.selectedItem?.rnb_id;
    }
    return null;
  });

  // Address marker
  const marker = useSelector((state: RootState) => state.marker);
  const [currentMarker, setCurrentMarker] = useState<maplibregl.Marker>();

  // Selected item
  const selectedItemType = useSelector(
    (state: RootState) => state.selectedItemType,
  );
  const selectedItem = useSelector((state: RootState) => state.selectedItem);

  const [previousSelectedItemType, setPreviousSelectedItemType] =
    useState<string>();
  const [previousSelectedItem, setPreviousSelectedItem] = useState<any>();

  const [previousHighlightedBuildingID, setPreviousHighlightedBuildingID] =
    useState<string>();

  const getFeatureTypeSource = (type: string) => {
    if (type === 'building') {
      return BUILDINGS_SOURCE;
    }

    if (type === 'ads') {
      return 'ads';
    }

    return null;
  };

  const getFeatureId = (type: string, item: any) => {
    if (type === 'building') {
      return item.rnb_id;
    }

    if (type === 'ads') {
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
      if (previousSelectedItemType && previousSelectedItem && map) {
        const source = getFeatureTypeSource(previousSelectedItemType);
        const id = getFeatureId(previousSelectedItemType, previousSelectedItem);

        if (source && id) {
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

      // Then, highlight the current selected item
      if (selectedItemType && selectedItem && map) {
        const source = getFeatureTypeSource(selectedItemType);
        const id = getFeatureId(selectedItemType, selectedItem);

        if (source && id) {
          map.setFeatureState(
            {
              source,
              id,
              sourceLayer: 'default',
            },
            { in_panel: true },
          );
        }

        // Finally, set the previous selected item
        setPreviousSelectedItemType(selectedItemType);
        setPreviousSelectedItem(selectedItem);
      }
    };

    if (map) {
      // Si on arrive sur la page avec un bâtiment pré-sélectionné (q=rnbId), il se peut que ce useEffect soit exécuté avant le chargement de la source BUILDINGS_SOURCE.
      // On ajoute donc cet événement pour palier à ce cas.
      map.on('sourcedata', (e) => {
        if (e.isSourceLoaded && e.sourceId === BUILDINGS_SOURCE) {
          toggleHighlight();
        }
      });

      toggleHighlight();
    }
  }, [selectedItem, previousSelectedItem, map]);
};
