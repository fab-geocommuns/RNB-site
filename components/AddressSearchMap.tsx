'use client';

// Hooks
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import styles from '@/styles/mapPage.module.scss';

// Bus
import Bus from '@/utils/Bus';

// Store
import { useDispatch, useSelector } from 'react-redux';
import {
  setMoveTo,
  setAddressSearchUnknownRNBId,
  setMarker,
  fetchBdg,
  openPanel,
  closePanel,
} from '@/stores/map/slice';

import AddressAutocomplete from '@/components/AddressAutocomplete';

export default function AddressSearchMap() {
  const unknown_rnb_id = useSelector(
    (state) => state.addressSearch.unknown_rnb_id,
  );

  // URL params
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [keyDown, setKeyDown] = useState(null);
  const [autocompleteActive, setAutocompleteActive] = useState(true);

  // State
  const moveTo = useSelector((state) => state.moveTo);
  const dispatch = useDispatch();

  const addressInput = useRef(null);

  const handleKeyDown = (e) => {
    setAutocompleteActive(true);
    dispatch(setAddressSearchUnknownRNBId(false));
    if (e.key === 'Enter' && queryIsRnbId(query)) {
      // special case, if the query is a RNB ID we bypass the address search
      dispatch(closePanel());
      handleBdgQuery(query);
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
      dispatch(closePanel());
      handleBdgQuery(q);
    } else {
      setQuery(q);
      // focus the input
      if (addressInput.current !== null) {
        addressInput.current.focus();
      }
    }
  };

  const handleBdgQuery = async (q) => {
    dispatch(fetchBdg(q)).then((res) => {
      if (res.payload !== null) {
        dispatch(openPanel());
        dispatch(
          setMoveTo({
            lat: res.payload.point.coordinates[1],
            lng: res.payload.point.coordinates[0],
            zoom: 20,
            fly: false,
          }),
        );

        Bus.emit('rnbid:search', {
          rnb_id: query,
        });
      } else {
        dispatch(setAddressSearchUnknownRNBId(true));
      }
    });
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

      // set the map to the coordinates
      const coordinates = coords.split(',');
      dispatch(
        setMarker({
          lat: parseFloat(coordinates[0]),
          lng: parseFloat(coordinates[1]),
        }),
      );
      dispatch(
        setMoveTo({
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
      setMarker({
        lat: position.lat,
        lng: position.lng,
      }),
    );
    // Move the map to the position
    dispatch(setMoveTo(position));
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
        <div className={styles.summerGamesShell}>
          <a
            href="https://rnb.beta.gouv.fr/blog/jeu-concours-de-lete"
            target="_blank"
          >
            ☀️ Jeu de l’été du RNB : objectif 10000 signalements
          </a>
        </div>

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
