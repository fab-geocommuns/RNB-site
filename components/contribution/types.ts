import { BuildingAddress as BuildingAddressFromAPI } from '@/stores/map/map-slice';

export type NewAddress = { id: string; label: string };
export type BuildingAddressType = BuildingAddressFromAPI | NewAddress;

export const isNewAddress = (
  address: BuildingAddressType,
): address is NewAddress => 'label' in address;

export const isExistingAddress = (
  address: BuildingAddressType,
): address is BuildingAddressFromAPI => 'source' in address;
