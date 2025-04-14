import AddressAutocomplete, {
  AddressSuggestion,
} from '@/components/AddressAutocomplete';
import { useState } from 'react';

type Props = {
  onSuggestionSelected: (suggestion: AddressSuggestion | null) => void;
  overrideSuggestionsClassname: string;
  render: (inputProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onBlur: () => void;
    onFocus: () => void;
  }) => React.ReactNode;
};

export default function AddressInput({
  onSuggestionSelected,
  overrideSuggestionsClassname,
  render,
}: Props) {
  const [autocompleteActive, setAutocompleteActive] = useState(false);
  const [query, setQuery] = useState('');
  const [keyDown, setKeyDown] = useState(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setKeyDown(e);
  };

  const renderedInputProps = {
    value: query,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setQuery(e.target.value),
    onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e),
    onBlur: () => setTimeout(() => setAutocompleteActive(false), 100),
    onFocus: () => setAutocompleteActive(true),
  };

  return (
    <>
      {render(renderedInputProps)}
      <AddressAutocomplete
        autocompleteActive={autocompleteActive}
        query={query}
        keyDown={keyDown}
        onSuggestionSelected={onSuggestionSelected}
        override_class={overrideSuggestionsClassname}
      ></AddressAutocomplete>
    </>
  );
}
