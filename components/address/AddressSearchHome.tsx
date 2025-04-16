'use client';

import { useRef } from 'react';
import { Providers } from '@/stores/provider';
import { useRouter } from 'next/navigation';

import { AddressSuggestion } from '@/components/address/AddressAutocomplete';
import AddressInput from '@/components/address/AddressInput';

import styles from '@/styles/home.module.scss';

export default function AddressSearchHome() {
  const formRef = useRef(null);
  const router = useRouter();

  const handleSuggestionSelected = (suggestion: AddressSuggestion) => {
    const query = suggestion.properties.label;
    const coords = `${suggestion.geometry.coordinates[1]},${suggestion.geometry.coordinates[0]}`;
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('coords', coords);
    router.push(`/carte?${params.toString()}`);
  };

  return (
    <Providers>
      <form action="/carte" method="get" ref={formRef}>
        <div className={styles['home-search-bar-wrapper']}>
          <div className="fr-search-bar">
            <AddressInput
              onSuggestionSelected={handleSuggestionSelected}
              additionalSuggestionsClassname={styles.autocomplete_suggestions}
              render={(inputProps: any) => (
                <>
                  <input
                    className="fr-input"
                    name="q"
                    placeholder="Un identifiant RNB : 1GA7PBYM1QDY ou une adresse : 42, rue des architectes, Nantes"
                    {...inputProps}
                  />
                  <button className="fr-btn" type="submit">
                    Rechercher
                  </button>
                </>
              )}
            />
          </div>
        </div>
      </form>
    </Providers>
  );
}
