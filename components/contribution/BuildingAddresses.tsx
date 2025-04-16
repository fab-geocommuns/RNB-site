import BuildingAddress from './BuildingAddress';
import Button from '@codegouvfr/react-dsfr/Button';
import { useState } from 'react';
import AddressInput from '@/components/address/AddressInput';
import { AddressSuggestion } from '@/components/address/AddressAutocomplete';
import { NewAddress, BuildingAddressType } from './types';
import { distance } from '@turf/turf';

function AddressCreator({
  onSubmit,
  buildingPoint,
}: {
  onSubmit: (address: NewAddress) => void;
  buildingPoint: [number, number];
}) {
  const [isCreating, setIsCreating] = useState(false);

  if (!isCreating) {
    return (
      <Button
        size="small"
        onClick={() => setIsCreating(true)}
        iconId="fr-icon-add-line"
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
    setIsCreating(false);
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
          s.properties.type === 'housenumber' && distanceInKm <= maxDistanceInKm
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
        onEscapePress={() => setIsCreating(false)}
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
};

export default function BuildingAddresses({
  addresses,
  onChange,
  buildingPoint,
}: BuildingAddressesProps) {
  const handleAddAddress = (address: BuildingAddressType) => {
    if (!addresses.some((a) => a.id === address.id)) {
      onChange([...addresses, address]);
    }
  };
  return (
    <div>
      {addresses.length === 0 ? (
        <div>
          <em>Aucune adresse liée</em>
        </div>
      ) : (
        addresses.map((address, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '0.5rem',
              alignItems: 'center',
            }}
          >
            <BuildingAddress
              address={address}
              onRemove={(removedAddress) =>
                onChange(addresses.filter((a) => a.id !== removedAddress.id))
              }
            />
          </div>
        ))
      )}
      <AddressCreator
        onSubmit={handleAddAddress}
        buildingPoint={buildingPoint}
      />
    </div>
  );
}
