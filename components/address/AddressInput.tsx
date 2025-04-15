'use client';

// Components
import AddressAutocomplete, { AddressSuggestion } from './AddressAutocomplete';
import { useState } from 'react';

type Props = {
  onSuggestionSelected: (suggestion: AddressSuggestion) => void;
  onEnterPress?: () => void;
  onEscapePress?: () => void;
  additionalSuggestionsClassname?: string;
  render: (inputProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onBlur: () => void;
    onFocus: () => void;
  }) => React.ReactNode;
  renderSuggestion?: (suggestion: AddressSuggestion) => React.ReactNode;
  geocodeQueryParams?: Record<string, string>;
};

export default function AddressInput({
  onSuggestionSelected,
  onEnterPress,
  onEscapePress,
  additionalSuggestionsClassname,
  render,
  renderSuggestion,
  geocodeQueryParams,
}: Props) {
  const [autocompleteActive, setAutocompleteActive] = useState(false);
  const [query, setQuery] = useState('');
  const [keyDown, setKeyDown] = useState<React.KeyboardEvent | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setKeyDown(e);

    if (e.key === 'Enter' && onEnterPress) {
      onEnterPress();
    }

    if (e.key === 'Escape' && autocompleteActive) {
      setAutocompleteActive(false);
    }

    if (
      e.key === 'Escape' &&
      (!autocompleteActive || query == '') &&
      onEscapePress
    ) {
      onEscapePress();
    }
  };

  const renderedInputProps = {
    value: query,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setQuery(e.target.value),
    onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e),
    onBlur: () => setTimeout(() => setAutocompleteActive(false), 100),
    onFocus: () => setAutocompleteActive(true),
    type: 'text',
    autoComplete: 'off',
    'data-1p-ignore': true,
  };

  const handleSuggestionSelected = (suggestion: AddressSuggestion) => {
    setQuery(suggestion?.properties.label);
    onSuggestionSelected(suggestion);
  };

  return (
    <>
      {render(renderedInputProps)}
      <AddressAutocomplete
        autocompleteActive={autocompleteActive}
        query={query}
        keyDown={keyDown}
        onSuggestionSelected={handleSuggestionSelected}
        additionalClassName={additionalSuggestionsClassname}
        renderSuggestion={renderSuggestion}
        geocodeQueryParams={geocodeQueryParams}
      ></AddressAutocomplete>
    </>
  );
}
