import { BuildingAddress as BuildingAddressType } from '@/stores/map/map-slice';
import Button from '@codegouvfr/react-dsfr/Button';

type BuildingAddressProps = {
  address: BuildingAddressType;
  onChange?: (address: BuildingAddressType) => void;
  onRemove?: (address: BuildingAddressType) => void;
  readOnly?: boolean;
};

export default function BuildingAddress({
  address,
  onChange,
  onRemove,
  readOnly = false,
}: BuildingAddressProps) {
  const formattedAddress = `${address.street_number}${address.street_rep} ${address.street}, ${address.city_zipcode} ${address.city_name}`;
  return (
    <div>
      {formattedAddress}
      {onChange && (
        <Button
          size="small"
          onClick={() => onChange(address)}
          iconId="fr-icon-edit-line"
        >
          <span></span>
        </Button>
      )}
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
