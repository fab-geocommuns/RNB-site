import { isNewAddress, BuildingAddressType } from './types';
import Button from '@codegouvfr/react-dsfr/Button';

type BuildingAddressProps = {
  address: BuildingAddressType;
  onRemove?: (address: BuildingAddressType) => void;
  disabled?: boolean;
};

function getAddressDisplayLabel(address: BuildingAddressType) {
  if (isNewAddress(address)) {
    return address.label;
  } else {
    return `${address.street_number}${address.street_rep} ${address.street}, ${address.city_zipcode} ${address.city_name}`;
  }
}

export default function BuildingAddress({
  disabled,
  address,
  onRemove,
}: BuildingAddressProps) {
  const label = getAddressDisplayLabel(address);
  return (
    <div style={{ display: 'flex', alignItems: 'center', lineHeight: '1.3' }}>
      <small>{label}</small>
      {onRemove && (
        // @ts-ignore
        <Button
          size="small"
          disabled={disabled}
          onClick={() => onRemove(address)}
          iconId="fr-icon-delete-line"
          priority="tertiary no outline"
        />
      )}
    </div>
  );
}
