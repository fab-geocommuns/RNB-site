import {
  BuildingStatus,
  BuildingStatusMap,
} from '@/stores/contribution/contribution-types';

type ContributionStatusPickerProps = {
  currentStatus: BuildingStatus;
};

export function ContributionStatusPicker({
  currentStatus,
}: ContributionStatusPickerProps) {
  return BuildingStatusMap[currentStatus];
}
