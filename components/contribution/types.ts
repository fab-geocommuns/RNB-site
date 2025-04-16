import { BuildingAddress as BuildingAddressFromAPI } from '@/stores/map/map-slice';

export type NewAddress = { id: string; label: string };
export type BuildingAddressType = BuildingAddressFromAPI | NewAddress;
