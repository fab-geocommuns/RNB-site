'use client';

import { useRef } from 'react';
import { Providers } from '@/stores/provider';
import { useRouter } from 'next/navigation';

import { AddressSuggestion } from '@/components/address/AddressAutocomplete';
import AddressInput from '@/components/address/AddressInput';

import styles from '@/styles/home.module.scss';
import { queryIsRnbId } from './utils';
import { homeSearchId } from '../SkipLinks';

export default function AddressSearchHome() {
  const router = useRouter();

  const handleSuggestionSelected = (suggestion: AddressSuggestion) => {
    const query = suggestion.properties.label;
    const defaultZoom = 20;
    const coords = `${suggestion.geometry.coordinates[1]},${suggestion.geometry.coordinates[0]},${defaultZoom}`;
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('coords', coords);
    router.push(`/carte?${params.toString()}`);
  };

  const handleSubmit = (value: string) => {
    if (!queryIsRnbId(value)) {
      return;
    }

    router.push(`/carte?q=${value}`);
  };

  return (
    <Providers>
      <div className={styles['home-search-bar-wrapper']}>
        <div className="fr-search-bar">
          <AddressInput
            onSuggestionSelected={handleSuggestionSelected}
            onEnterPress={handleSubmit}
            additionalSuggestionsClassname={styles.autocomplete_suggestions}
            render={(inputProps: any) => (
              <>
                <input
                  id={homeSearchId}
                  className="fr-input"
                  name="q"
                  placeholder="Rechercher un identifiant RNB ou une adresse"
                  aria-label="Rechercher un identifiant RNB ou une adresse"
                  {...inputProps}
                />
                <button
                  className="fr-btn"
                  type="submit"
                  onClick={() => handleSubmit(inputProps.value)}
                >
                  Rechercher
                </button>
              </>
            )}
          />
        </div>
      </div>
    </Providers>
  );
}
