'use client';

// Hooks
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import styles from '@/styles/mapPage.module.scss';

// Bus
import Bus from '@/utils/Bus';

// Store
import { useDispatch, useSelector } from 'react-redux';

import AddressAutocomplete, {
  AddressSuggestion,
} from '@/components/address/AddressAutocomplete';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { queryIsRnbId, queryIsCoordinates } from '@/components/address/utils';
import { selectBuildingAndSetOperationUpdate } from '@/stores/edition/edition-slice';

export default function AddressSearchMap() {
  const unknown_rnb_id = useSelector(
    (state: RootState) => state.map.addressSearch.unknown_rnb_id,
  );

  // URL params
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [keyDown, setKeyDown] = useState<React.KeyboardEvent | null>(null);
  const [autocompleteActive, setAutocompleteActive] = useState(true);

  // State
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const dispatch: AppDispatch = useDispatch();

  const addressInput = useRef<HTMLInputElement>(null);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    setAutocompleteActive(true);
    dispatch(Actions.map.setAddressSearchUnknownRNBId(false));

    // If the query is a RNB ID we bypass the address search
    if (e.key === 'Enter' && queryIsRnbId(query)) {
      const building = (await dispatch(
        selectBuildingAndSetOperationUpdate(query),
      )) as any;
      if (building.payload) {
        dispatch(
          Actions.map.setMoveTo({
            lat: parseFloat(building.payload.point.coordinates[1]),
            lng: parseFloat(building.payload.point.coordinates[0]),
            zoom: 20,
          }),
        );
      }
      return;
    }

    // If the query is coordinates we bypass the address search as well and focus the area
    if (e.key === 'Enter' && queryIsCoordinates(query)) {
      const coordinates = query.split(',');
      // zoom is optional but handled
      const zoom = coordinates.length == 3 ? coordinates[2] : 20;

      dispatch(
        Actions.map.setMoveTo({
          lat: parseFloat(coordinates[0]),
          lng: parseFloat(coordinates[1]),
          zoom: zoom,
        }),
      );
      return;
    }

    setKeyDown(e);
  };

  // used when loading the page with a rnb id in the URL
  const search = async (q: string, coords: string[] | null) => {
    if (queryIsRnbId(q)) {
      setAutocompleteActive(false);
      setQuery(q);
      const building = (await dispatch(
        selectBuildingAndSetOperationUpdate(q),
      )) as any;
      dispatch(
        Actions.map.setMoveTo({
          lat: parseFloat(building.payload.point.coordinates[1]),
          lng: parseFloat(building.payload.point.coordinates[0]),
          zoom: coords?.length ? parseFloat(coords[2]) : 20,
        }),
      );
    } else {
      setQuery(q);
      // focus the input
      if (addressInput.current !== null) {
        addressInput.current.focus();
      }
    }
  };

  const featureToPosition = (feature: any) => {
    const mapPosition = {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      zoom: 17,
    };
    if (feature.properties.type == 'municipality') {
      mapPosition.zoom = 13;
    }
    if (feature.properties.type == 'housenumber') {
      mapPosition.zoom = 18;
    }
    return mapPosition;
  };

  const handleCoordinates = (coords: string[]) => {
    // fill the input with the address
    setAutocompleteActive(false);
    dispatch(
      Actions.map.setMoveTo({
        lat: parseFloat(coords[0]),
        lng: parseFloat(coords[1]),
        zoom: parseFloat(coords[2]),
      }),
    );
  };

  useEffect(() => {
    const q = params.get('q');
    const coords = params.get('coords');
    const coordinates =
      coords && queryIsCoordinates(coords) ? coords.split(',') : null;
    if (q !== null) search(q, coordinates);
    if (coordinates !== null) handleCoordinates(coordinates);
  }, []);

  // @ts-ignore
  const selectSuggestion = (suggestion) => {
    const position = featureToPosition(suggestion);
    // Add a marker to the map
    dispatch(
      Actions.map.setMarkerAndReset({
        lat: position.lat,
        lng: position.lng,
      }),
    );
    // Move the map to the position
    dispatch(Actions.map.setMoveTo(position));
    setQuery(suggestion.properties.label);
    Bus.emit('address:search', {
      search: suggestion.label,
    });
  };

  useEffect(() => {
    if (selectedItem && selectedItem._type === 'building') {
      setQuery(selectedItem.rnb_id);
    } else if (!selectedItem) {
      setQuery('');
    }
  }, [selectedItem]);

  // @ts-ignore
  const handleSuggestionSelected = (suggestion: AddressSuggestion | null) => {
    if (suggestion !== null) {
      selectSuggestion(suggestion);
    }
  };

  const handleQueryResults = (query: string, results: AddressSuggestion[]) => {
    dispatch(Actions.map.setAddressSearchQuery(query));
    dispatch(Actions.map.setAddressSearchResults(results));
  };

  return (
    <>
      <div
        className={`${styles.map__InputShell} ${unknown_rnb_id ? styles['shake'] : ''}`}
      >
        <input
          className={
            'fr-input ' + (unknown_rnb_id ? styles['fr-input--error'] : '')
          }
          placeholder="Chercher une adresse, un identifiant RNB"
          type="text"
          autoComplete="off"
          data-1p-ignore
          name="address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          id="address"
          ref={addressInput}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setAutocompleteActive(false), 100)}
          onFocus={() => setAutocompleteActive(true)}
        />
        <AddressAutocomplete
          autocompleteActive={autocompleteActive}
          query={query}
          keyDown={keyDown}
          onSuggestionSelected={handleSuggestionSelected}
          onQueryResults={handleQueryResults}
        ></AddressAutocomplete>
      </div>
    </>
  );
}
