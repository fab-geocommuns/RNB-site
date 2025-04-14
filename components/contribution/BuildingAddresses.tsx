import BuildingAddress from './BuildingAddress';
import { BuildingAddress as BuildingAddressType } from '@/stores/map/map-slice';
import Button from '@codegouvfr/react-dsfr/Button';
import { useState } from 'react';
import AddressInput from '../AddressInput';
import { AddressSuggestion } from '../AddressAutocomplete';

function AddressCreator({
  onSubmit,
}: {
  onSubmit: (address: BuildingAddressType) => void;
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

  const handleSubmit = (suggestion: AddressSuggestion | null) => {
    const newAddress = {
      id: '',
      banId: suggestion?.properties.id || '',
      source: '',
      street_number: suggestion?.properties.housenumber || '',
      street_rep: suggestion?.properties.street_rep || '',
      street: suggestion?.properties.street || '',
      city_zipcode: suggestion?.properties.city_zipcode || '',
      city_name: suggestion?.properties.city_name || '',
      city_insee_code: suggestion?.properties.city_insee_code || '',
    };
    onSubmit(newAddress);
    setIsCreating(false);
  };

  return (
    <div>
      <AddressInput
        onSuggestionSelected={(suggestion) => {
          if (suggestion) {
            handleSubmit(suggestion);
          }
        }}
        onEnterPress={() => {}}
        render={(inputProps) => (
          <input
            {...inputProps}
            type="text"
            placeholder="Nouvelle addresse"
            autoFocus
          />
        )}
      />
    </div>
  );
}

type BuildingAddressesProps = {
  addresses: BuildingAddressType[];
  onChange: (addresses: BuildingAddressType[]) => void;
};

export default function BuildingAddresses({
  addresses,
  onChange,
}: BuildingAddressesProps) {
  const handleAddAddress = (address: BuildingAddressType) => {
    if (!addresses.some((a) => a.banId === address.banId)) {
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
              onChange={(newAddress) =>
                onChange(
                  addresses.map((a) =>
                    a.banId === address.banId ? newAddress : a,
                  ),
                )
              }
              onRemove={(removedAddress) =>
                onChange(
                  addresses.filter((a) => a.banId !== removedAddress.banId),
                )
              }
            />
          </div>
        ))
      )}
      <AddressCreator onSubmit={handleAddAddress} />
    </div>
  );
}
