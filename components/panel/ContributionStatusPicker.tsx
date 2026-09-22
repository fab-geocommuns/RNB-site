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
  const severity = currentStatus === 'demolished' ? 'error' : 'info';
  return (
    <span
      className={`fr-badge fr-badge--sm fr-badge--no-icon fr-badge--${severity}`}
    >
      {BuildingStatusMap[currentStatus]}
    </span>
  );
}
