import { ContributionAddress } from '@/stores/contribution/contribution-slice';
import { useMemo, useState } from 'react';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import styles from '@/styles/home.module.scss';
import { createModal } from '@codegouvfr/react-dsfr/Modal';

type UseBanAddressModalPickerProps = (address: ContributionAddress) => void;

export function useBanAddressModalPicker(
  onAddressSelected: UseBanAddressModalPickerProps,
) {
  const [internalAddress, setInternalAddress] = useState<ContributionAddress>();
  const [autocompleteActive, setAutocompleteActive] = useState(true);
  const [query, setQuery] = useState('');
  const [keyDown, setKeyDown] = useState<any>(null);

  const modal = useMemo(
    () =>
      createModal({
        id: 'ban-modal-adresse-picker-' + Math.random(),
        isOpenedByDefault: false,
      }),
    [],
  );

  const handleSuggestionSelected = ({ suggestion }: any) => {
    const numberMatch = suggestion.properties.housenumber.match(/[0-9]*/);
    const street_rep =
      (numberMatch
        ? suggestion.properties.housenumber.replace(numberMatch[0], '')
        : undefined) || undefined;
    const address = {
      id: suggestion.properties.id,
      street_number: numberMatch ? numberMatch[0] : undefined,
      street_rep,
      street: suggestion.properties.street,
      city_zipcode: suggestion.properties.postcode,
      city_name: suggestion.properties.city,
      banId: suggestion.properties.banId,
    };

    setInternalAddress(address);
    setQuery(suggestion.properties.label);
  };

  const modalComponent = useMemo(
    () => (
      <modal.Component
        title={`Sélectionner une adresse`}
        concealingBackdrop={false}
        size="large"
        buttons={[
          {
            doClosesModal: true,
            children: 'Annuler',
          },
          {
            doClosesModal: true,
            onClick: () => {
              if (internalAddress) onAddressSelected(internalAddress);
              setInternalAddress(undefined);
              setQuery('');
            },
            disabled: !internalAddress,
            children: 'Valider',
          },
        ]}
      >
        <div className={styles['home-search-bar-wrapper']}>
          <div className="fr-search-bar">
            <input
              className="fr-input"
              type="text"
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={setKeyDown}
              value={query}
              name="q"
              placeholder="42, rue des architectes, Nantes"
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
      </modal.Component>
    ),
    [autocompleteActive, internalAddress, keyDown, query],
  );

  return {
    modalComponent,
    open: () => modal.open(),
    close: () => modal.close(),
  };
}
