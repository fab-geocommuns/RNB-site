import {
  BuildingStatusType,
  BuildingStatusMap,
} from '@/stores/contribution/contribution-types';

type ContributionStatusPickerProps = {
  currentStatus: BuildingStatusType;
};

export function ContributionStatusPicker({
  currentStatus,
}: ContributionStatusPickerProps) {
  return BuildingStatusMap[currentStatus];
}
