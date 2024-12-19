import { ContributionAddress } from '@/stores/contribution/contribution-slice';
import { useMemo, useState } from 'react';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import styles from '@/styles/home.module.scss';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import * as turf from '@turf/turf';
import { Alert } from '@codegouvfr/react-dsfr/Alert';

type UseBanAddressModalPickerProps = {
  onAddressSelected: (address: ContributionAddress) => void;
  warning?: {
    distanceInKilometers: number;
    point: [number, number];
  };
};

export function useBanAddressModalPicker({
  onAddressSelected,
  warning,
}: UseBanAddressModalPickerProps) {
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
    if (!suggestion) return;

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
      point: suggestion.geometry.coordinates,
    };

    setInternalAddress(address);
    setQuery(suggestion.properties.label);
  };

  // Warning message
  const warningComponent = useMemo(() => {
    if (!warning || !internalAddress) return;

    console.log(warning.point);
    const from = turf.point(warning.point);
    const to = turf.point(internalAddress.point);
    const distance = turf.distance(from, to, {
      units: 'kilometers',
    });

    if (distance >= warning.distanceInKilometers) {
      return (
        <div style={{ marginTop: '1rem' }}>
          <Alert
            small={true}
            description={`Cette adresse semble éloignée de la position du RNB ID (environ ${Math.round(distance)}km), veuillez vérifier votre saisie.`}
            severity="warning"
          />
        </div>
      );
    }
  }, [internalAddress, warning]);

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
        <div>{warningComponent}</div>
      </modal.Component>
    ),
    [autocompleteActive, internalAddress, keyDown, query],
  );

  return {
    modalComponent,
    open: (initialValue?: string) => {
      modal.open();

      if (initialValue) {
        setQuery(initialValue);
      }
    },
    close: () => modal.close(),
  };
}
