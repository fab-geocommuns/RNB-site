import { BuildingAddressType } from './types';
import Button from '@codegouvfr/react-dsfr/Button';

type BuildingAddressProps = {
  address: BuildingAddressType;
  onChange?: (address: BuildingAddressType) => void;
  onRemove?: (address: BuildingAddressType) => void;
};

function getAddressDisplayLabel(address: BuildingAddressType) {
  if (typeof address.label === 'string') {
    return address.label;
  } else {
    return `${address.street_number}${address.street_rep} ${address.street}, ${address.city_zipcode} ${address.city_name}`;
  }
}

export default function BuildingAddress({
  address,
  onChange,
  onRemove,
}: BuildingAddressProps) {
  const label = getAddressDisplayLabel(address);
  return (
    <div>
      {label}
      {onRemove && (
        <Button
          size="small"
          onClick={() => onRemove(address)}
          iconId="fr-icon-delete-line"
        >
          <span></span>
        </Button>
      )}
    </div>
  );
}
