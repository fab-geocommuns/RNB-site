'use client';

// Hooks
import { useState, useEffect, useRef } from 'react';

import styles from '@/styles/addressAutocomplete.module.scss';

import { Feature, FeatureCollection, Point } from 'geojson';

type BANAddressAttributes = {
  id: string;
  label: string;
  housenumber: string;
  street: string;
  city: string;
  citycode: string;
  context: string;
  district: string;
  postcode: string;
  score: number;
  name: string;
  type: 'housenumber' | 'street' | 'locality' | 'municipality';
  x: number;
  y: number;
  importance: number;
};

export type AddressSuggestion = Feature<Point, BANAddressAttributes>;

type BANGeocodingResult = FeatureCollection<Point, BANAddressAttributes>;

type Props = {
  autocompleteActive: boolean;
  query: string;
  keyDown: React.KeyboardEvent | null;
  onSuggestionSelected: (suggestion: AddressSuggestion) => void;
  additionalClassName?: string;
  onQueryResults?: (
    query: string,
    results: AddressSuggestion[],
  ) => void | AddressSuggestion[];
  renderSuggestion?: (suggestion: AddressSuggestion) => React.ReactNode;
  geocodeQueryParams?: Record<string, string>;
};

export default function AddressAutocomplete({
  autocompleteActive,
  query,
  keyDown,
  onSuggestionSelected,
  additionalClassName = '',
  onQueryResults,
  renderSuggestion = (suggestion: AddressSuggestion) =>
    suggestion.properties.label,
  geocodeQueryParams = {},
}: Props) {
  // contains the address suggestions given by the BAN API
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  // used to highlight and choose an address suggestion
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] =
    useState(-1);

  const typeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // when a suggestion is chosen, this is set to true to prevent an extra call the the API
  const [suggestionChosen, setSuggestionChosen] = useState(false);
  const apiUrl = 'https://api-adresse.data.gouv.fr/search/';

  useEffect(() => {
    if (autocompleteActive) {
      const e = keyDown;
      if (e !== null) {
        // pick the suggestion with the arrow keys
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (highlightedSuggestionIndex < addressSuggestions.length - 1) {
            setHighlightedSuggestionIndex(highlightedSuggestionIndex + 1);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (highlightedSuggestionIndex > 0) {
            setHighlightedSuggestionIndex(highlightedSuggestionIndex - 1);
          }
          // select the suggestion with the enter key
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setAddressSuggestions([]);
          setHighlightedSuggestionIndex(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          let suggestion = null;
          if (
            addressSuggestions.length > 1 &&
            highlightedSuggestionIndex >= 0
          ) {
            suggestion = addressSuggestions[highlightedSuggestionIndex];
            // you don't need to select a suggestion if there is only one
          } else if (addressSuggestions.length == 1) {
            suggestion = addressSuggestions[0];
          }
          selectSuggestion(suggestion);
        } else {
          setSuggestionChosen(false);
        }
      }
    }
  }, [keyDown]);

  const selectSuggestion = (suggestion: AddressSuggestion | null) => {
    if (suggestion) {
      setSuggestionChosen(true);
      setAddressSuggestions([]);
      setHighlightedSuggestionIndex(-1);
      onSuggestionSelected(suggestion);
    }
  };

  useEffect(() => {
    if (!suggestionChosen && autocompleteActive) {
      setHighlightedSuggestionIndex(-1);
      if (query.length < 3) {
        setAddressSuggestions([]);
      } else {
        if (typeTimeoutRef.current) {
          clearTimeout(typeTimeoutRef.current);
        }

        typeTimeoutRef.current = setTimeout(() => {
          handleAddressQuery();
        }, 300);
      }
    }
  }, [query]);

  const handleAddressQuery = async () => {
    const geocodingResult = (await fetchBanAPI(query)) as BANGeocodingResult;

    let results = geocodingResult.features;
    if (results && onQueryResults) {
      const newResults = onQueryResults(query, geocodingResult.features);
      if (newResults) {
        results = newResults;
      }
    }
    if (results && results.length > 0) {
      setAddressSuggestions(results);
      setHighlightedSuggestionIndex(-1);
    }
    return results;
  };

  const fetchBanAPI = async (q: string) => {
    let query_url = new URL(apiUrl);
    query_url.searchParams.set('q', q);
    query_url.searchParams.set('autocomplete', '1');

    Object.keys(geocodeQueryParams).forEach((key) => {
      query_url.searchParams.set(key, geocodeQueryParams[key]);
    });

    return new Promise((resolve, reject) => {
      fetch(query_url)
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const suggestions = addressSuggestions.map((s, i) => (
    <div
      onMouseEnter={() => setHighlightedSuggestionIndex(i)}
      onMouseDown={() => selectSuggestion(s)}
      className={
        styles.suggestion +
        ' ' +
        (highlightedSuggestionIndex == i ? styles.selected : '')
      }
      key={s.properties.id}
    >
      {renderSuggestion(s)}
    </div>
  ));

  return suggestions.length > 0 && autocompleteActive ? (
    <div
      className={styles.autocomplete_suggestions + ' ' + additionalClassName}
    >
      {suggestions}
    </div>
  ) : null;
}
