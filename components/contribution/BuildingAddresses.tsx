import BuildingAddress from './BuildingAddress';
import Button from '@codegouvfr/react-dsfr/Button';
import { useState } from 'react';
import AddressInput from '@/components/address/AddressInput';
import { AddressSuggestion } from '@/components/address/AddressAutocomplete';
import { NewAddress, BuildingAddressType } from './types';
import { distance } from '@turf/turf';
import styles from '@/styles/contribution/editPanel.module.scss';

function AddressCreator({
  onSubmit,
  buildingPoint,
  disabledAddressIds,
  isCreating,
  onToggleCreating,
  disabled,
}: {
  onSubmit: (address: NewAddress) => void;
  buildingPoint: [number, number];
  disabledAddressIds: string[];
  isCreating: boolean;
  onToggleCreating: (isCreating: boolean) => void;
  disabled: boolean;
}) {
  if (!isCreating) {
    return (
      <Button
        size="small"
        onClick={() => onToggleCreating(true)}
        iconId="fr-icon-add-line"
        priority="tertiary"
        disabled={disabled}
      >
        Ajouter une adresse
      </Button>
    );
  }

  const handleSubmit = (suggestion: AddressSuggestion) => {
    const newAddress = {
      id: suggestion.properties.id,
      label: suggestion.properties.label,
    };
    onSubmit(newAddress);
    onToggleCreating(false);
  };

  const filterAndSortSuggestions = (
    query: string,
    suggestions: AddressSuggestion[],
  ) => {
    const maxDistanceInKm = 10;
    return suggestions
      .filter((s) => {
        const distanceInKm = distance(s.geometry.coordinates, buildingPoint);
        return (
          s.properties.type === 'housenumber' &&
          distanceInKm <= maxDistanceInKm &&
          !disabledAddressIds.includes(s.properties.id)
        );
      })
      .sort((a, b) => {
        const distanceA = distance(a.geometry.coordinates, buildingPoint);
        const distanceB = distance(b.geometry.coordinates, buildingPoint);
        return distanceA - distanceB;
      });
  };

  return (
    <div>
      <AddressInput
        onSuggestionSelected={handleSubmit}
        onQueryResults={filterAndSortSuggestions}
        render={(inputProps: any) => (
          <input
            {...inputProps}
            className="fr-input"
            type="text"
            placeholder="Nouvelle addresse"
            autoFocus
          />
        )}
        renderSuggestion={(suggestion: AddressSuggestion) => {
          const distanceInKm = distance(
            suggestion.geometry.coordinates,
            buildingPoint,
          ).toFixed(2);
          return (
            <div>
              {suggestion.properties.label} (à {distanceInKm} km)
            </div>
          );
        }}
        onEscapePress={() => onToggleCreating(false)}
        geocodeQueryParams={{
          lat: buildingPoint[1].toString(),
          lon: buildingPoint[0].toString(),
        }}
      />
    </div>
  );
}

type BuildingAddressesProps = {
  addresses: BuildingAddressType[];
  onChange: (addresses: BuildingAddressType[]) => void;
  buildingPoint: [number, number];
  disabled: boolean;
};

export default function BuildingAddresses({
  addresses,
  onChange,
  buildingPoint,
  disabled,
}: BuildingAddressesProps) {
  const [isCreating, setIsCreating] = useState(false);
  const handleAddAddress = (address: BuildingAddressType) => {
    if (!addresses.some((a) => a.id === address.id)) {
      onChange([...addresses, address]);
    }
  };
  return (
    <div className={styles.panelSection}>
      <span className={`fr-text--xs ${styles.sectionTitle}`}>Adresses</span>

      {addresses.length === 0 && !isCreating ? (
        <div>
          <small>Aucune adresse liée</small>
        </div>
      ) : (
        addresses.map((address, index) => (
          <div
            key={index}
            className="fr-text--lg"
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '0',
              alignItems: 'center',
            }}
          >
            <BuildingAddress
              disabled={disabled}
              address={address}
              onRemove={(removedAddress) =>
                onChange(addresses.filter((a) => a.id !== removedAddress.id))
              }
            />
          </div>
        ))
      )}
      <div className="fr-pt-2v"></div>
      <AddressCreator
        disabled={disabled}
        isCreating={isCreating}
        onToggleCreating={setIsCreating}
        onSubmit={handleAddAddress}
        buildingPoint={buildingPoint}
        disabledAddressIds={addresses.map((a) => a.id)}
      />
    </div>
  );
}
