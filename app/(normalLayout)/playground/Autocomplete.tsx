'use client';

import Input, { InputProps } from '@codegouvfr/react-dsfr/Input';
import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';

type AutocompleteProps = {
  options: string[];
} & InputProps;

export default function Autocomplete({
  options,
  nativeInputProps,
  ...inputProps
}: AutocompleteProps) {
  const [listId, setListId] = useState<string | undefined>(undefined);
  const [displayedOptions, setDisplayedOptions] = useState<string[]>([]);

  useEffect(() => {
    setListId(`autocomplete-${Math.random().toString(36).substring(2, 15)}`);
  }, []);

  const originalNativeOnChange = nativeInputProps?.onChange;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    originalNativeOnChange?.(event);
    const value = event.target.value;

    if (value.length < 3) {
      setDisplayedOptions([]);
    } else {
      const fuzzySearch = new Fuse(options);
      const results = fuzzySearch.search(value);
      const top5 = results.slice(0, 5);
      setDisplayedOptions(top5.map((result) => result.item));
    }
  };

  return (
    <>
      <Input
        {...inputProps}
        nativeInputProps={{
          ...(nativeInputProps || {}),
          list: listId,
          onChange,
        }}
      />

      <datalist id={listId}>
        {displayedOptions.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </datalist>
    </>
  );
}
