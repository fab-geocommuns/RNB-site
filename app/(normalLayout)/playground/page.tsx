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
          onEnterPress={() => {
            alert('enter pressed');
          }}
          onSuggestionSelected={(suggestion) => {
            alert('suggestion selected ' + JSON.stringify(suggestion));
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
        />
      )}
    </div>
  );
}
