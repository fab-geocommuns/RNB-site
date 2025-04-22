'use client';

import AddressInput from '@/components/address/AddressInput';
import { useState } from 'react';

export default function PlaygroundPage() {
  const [displayInput, setDisplayInput] = useState(false);
  return (
    <div>
      {!displayInput && (
        <a href="#" onClick={() => setDisplayInput(true)}>
          Show input
        </a>
      )}
      {displayInput && (
        <AddressInput
          onSuggestionSelected={(suggestion) => {
            alert('suggestion selected ' + JSON.stringify(suggestion));
          }}
          onQueryResults={(query, results) => {
            return results.sort((a, b) =>
              a.properties.id.localeCompare(b.properties.id),
            );
          }}
          onEscapePress={() => {
            setDisplayInput(false);
          }}
          render={(props) => (
            <input
              {...props}
              autoFocus
              style={{ width: '240px', border: '1px solid red' }}
            />
          )}
          renderSuggestion={(suggestion) => (
            <span style={{ border: '1px dotted green' }}>
              {suggestion.properties.label} (clé ban: {suggestion.properties.id}
              )
            </span>
          )}
          geocodeQueryParams={{
            postcode: '75020',
          }}
        />
      )}
    </div>
  );
}
