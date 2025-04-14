import BuildingAddress from './BuildingAddress';
import { BuildingAddress as BuildingAddressType } from '@/stores/map/map-slice';
import Button from '@codegouvfr/react-dsfr/Button';
import { useState } from 'react';

function AddressCreator({
  onSubmit,
}: {
  onSubmit: (address: BuildingAddressType) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [banId, setBanId] = useState('');

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

  const handleSubmit = () => {
    const newAddress = {
      id: '',
      banId: banId,
      source: '',
      street_number: '',
      street_rep: '',
      street: '',
      city_zipcode: '',
      city_name: '',
      city_insee_code: '',
    };
    onSubmit(newAddress);
    setIsCreating(false);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="BAN ID"
        value={banId}
        onChange={(e) => setBanId(e.target.value)}
      />
      <button onClick={handleSubmit}>Ajouter</button>
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
