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

export default function AddressSearchMap() {
  const unknown_rnb_id = useSelector(
    (state: RootState) => state.map.addressSearch.unknown_rnb_id,
  );

  // URL params
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [keyDown, setKeyDown] = useState(null);
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
        Actions.map.selectBuilding(query),
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

      dispatch(
        Actions.map.setMoveTo({
          lat: parseFloat(coordinates[0]),
          lng: parseFloat(coordinates[1]),
          zoom: 20,
        }),
      );
      return;
    }

    setKeyDown(e);
  };

  const queryIsRnbId = (q: string) => {
    return q.match(
      /^[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}$/,
    );
  };

  const queryIsCoordinates = (q: string) => {
    // Format is `lat,lng,zoom`
    return q.match(
      /^[0-9]{1,2}\.[0-9]{1,10},(-)?[0-9]{1,2}\.[0-9]{1,10},[0-9]{1,2}\.?[0-9]{0,10}$/,
    );
  };

  // used when loading the page with a rnb id in the URL
  const search = async (q: string) => {
    if (queryIsRnbId(q)) {
      setAutocompleteActive(false);
      setQuery(q);
      const building = (await dispatch(Actions.map.selectBuilding(q))) as any;
      dispatch(
        Actions.map.setMoveTo({
          lat: parseFloat(building.payload.point.coordinates[1]),
          lng: parseFloat(building.payload.point.coordinates[0]),
          zoom: 20,
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

  const handleCoordinates = (coords: string) => {
    if (queryIsCoordinates(coords)) {
      // fill the input with the address
      setAutocompleteActive(false);
      const coordinates = coords.split(',');

      dispatch(
        Actions.map.setMoveTo({
          lat: parseFloat(coordinates[0]),
          lng: parseFloat(coordinates[1]),
          zoom: parseFloat(coordinates[2]),
        }),
      );
    }
  };

  useEffect(() => {
    const q = params.get('q');
    const coords = params.get('coords');
    if (q !== null) {
      search(q);
    }
    if (coords !== null) {
      handleCoordinates(coords);
    }
  }, []);

  // @ts-ignore
  const selectSuggestion = (suggestion) => {
    const position = featureToPosition(suggestion);
    // Add a marker to the map
    dispatch(
      Actions.map.setMarker({
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
