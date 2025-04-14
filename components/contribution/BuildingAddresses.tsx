import { useState } from 'react';
import BuildingAddress from './BuildingAddress';
import Button from '@codegouvfr/react-dsfr/Button';

export default function BuildingAddresses() {
  const [addresses, setAddresses] = useState<string[]>([]);

  const addAddress = () => {
    setAddresses([...addresses, `Address ${addresses.length + 1}`]);
  };

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h4>Addresses</h4>
      {addresses.map((address, index) => (
        <div
          key={index}
          style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}
        >
          <BuildingAddress text={address} />
          <Button
            size="small"
            onClick={() => removeAddress(index)}
            iconId="fr-icon-delete-line"
          >
            <span></span>
          </Button>
        </div>
      ))}
      <Button size="small" onClick={addAddress} iconId="fr-icon-add-line">
        Add address
      </Button>
    </div>
  );
}
