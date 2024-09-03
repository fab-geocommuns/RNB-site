'use client';

// Hooks
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import styles from '@/styles/mapPage.module.scss';

// Bus
import Bus from '@/utils/Bus';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { selectBuilding } from '@/stores/map/slice';

import AddressAutocomplete from '@/components/AddressAutocomplete';
import { Actions, AppDispatch, RootState } from '@/stores/map/store';

export default function AddressSearchMap() {
  const unknown_rnb_id = useSelector(
    (state: RootState) => state.addressSearch.unknown_rnb_id,
  );

  // URL params
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [keyDown, setKeyDown] = useState(null);
  const [autocompleteActive, setAutocompleteActive] = useState(true);

  // State
  const moveTo = useSelector((state: RootState) => state.moveTo);
  const dispatch: AppDispatch = useDispatch();

  const addressInput = useRef<HTMLInputElement>(null);

  const handleKeyDown = async (e) => {
    setAutocompleteActive(true);
    dispatch(Actions.map.setAddressSearchUnknownRNBId(false));
    if (e.key === 'Enter' && queryIsRnbId(query)) {
      // special case, if the query is a RNB ID we bypass the address search
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
    } else {
      setKeyDown(e);
    }
  };

  const queryIsRnbId = (q: string) => {
    return q.match(
      /^[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}$/,
    );
  };

  const queryIsCoordinates = (q: string) => {
    return q.match(/^[0-9]{1,2}\.[0-9]{1,10},(-)?[0-9]{1,2}\.[0-9]{1,10}$/);
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

  const handleCoordinates = (q: string, coords: string) => {
    if (queryIsCoordinates(coords)) {
      // fill the input with the address
      setAutocompleteActive(false);
      setQuery(q);
      const coordinates = coords.split(',');
      dispatch(
        Actions.map.setMarker({
          lat: parseFloat(coordinates[0]),
          lng: parseFloat(coordinates[1]),
        }),
      );
      dispatch(
        Actions.map.setMoveTo({
          lat: parseFloat(coordinates[0]),
          lng: parseFloat(coordinates[1]),
          zoom: 20,
        }),
      );
    }
  };

  useEffect(() => {
    const q = params.get('q');
    const coords = params.get('coords');
    if (coords !== null && q !== null) {
      handleCoordinates(q, coords);
    } else if (q !== null) {
      search(q);
    }
  }, []);

  const select_suggestion = (suggestion) => {
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

  const handleSuggestionSelected = ({ suggestion }) => {
    if (suggestion !== null) {
      select_suggestion(suggestion);
    }
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
        ></AddressAutocomplete>
      </div>
    </>
  );
}
