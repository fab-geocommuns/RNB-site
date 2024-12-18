'use client';

import { useState, useRef, use, useEffect } from 'react';
import { Providers } from '@/stores/provider';
import { useRouter } from 'next/navigation';

import AddressAutocomplete from '@/components/AddressAutocomplete';

import styles from '@/styles/home.module.scss';

export default function AddressSearchHome() {
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState(null);
  const [keyDown, setKeyDown] = useState(null);
  const [navigateToMap, setnavigateToMap] = useState(false);
  const [autocompleteActive, setAutocompleteActive] = useState(true);
  const formRef = useRef(null);
  const router = useRouter();

  const handleKeyDown = (e) => {
    setKeyDown(e);
  };

  const handleSuggestionSelected = ({ suggestion }) => {
    if (suggestion !== null) {
      setQuery(suggestion.properties.label);
      setCoords(
        `${suggestion.geometry.coordinates[1]},${suggestion.geometry.coordinates[0]}`,
      );
    }
    setnavigateToMap(true);
  };

  useEffect(() => {
    if (navigateToMap) {
      let params = new URLSearchParams();
      if (query) {
        params.append('q', query);
      }
      if (coords) {
        params.append('coords', coords);
      }
      router.push(`/carte?${params.toString()}`);
    }
  }, [navigateToMap]);

  return (
    <Providers>
      <form action="/carte" method="get" ref={formRef}>
        <div className={styles['home-search-bar-wrapper']}>
          <div className="fr-search-bar">
            <input
              className="fr-input"
              type="text"
              autoComplete="off"
              data-1p-ignore
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              value={query}
              name="q"
              placeholder="un identifiant RNB : 1GA7PBYM1QDY ou une adresse : 42, rue des architectes, Nantes"
              onBlur={() => setTimeout(() => setAutocompleteActive(false), 100)}
              onFocus={() => setAutocompleteActive(true)}
            />
            <button className="fr-btn" type="submit">
              Rechercher
            </button>
          </div>
          <AddressAutocomplete
            autocompleteActive={autocompleteActive}
            query={query}
            keyDown={keyDown}
            onSuggestionSelected={handleSuggestionSelected}
            override_class={styles.autocomplete_suggestions}
          ></AddressAutocomplete>
        </div>
      </form>
    </Providers>
  );
}
