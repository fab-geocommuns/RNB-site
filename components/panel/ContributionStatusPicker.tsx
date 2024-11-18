import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  BuildingStatus,
  BuildingStatusMap,
} from '@/stores/contribution/contribution-types';
import React from 'react';
import Select from '@codegouvfr/react-dsfr/Select';

type ContributionStatusPickerProps = {
  currentStatus: BuildingStatus;
};

export function ContributionStatusPicker({
  currentStatus,
}: ContributionStatusPickerProps) {
  const dispatch: AppDispatch = useDispatch();
  const status = useSelector((state: RootState) => state.contribution.status);
  const editing = useSelector((state: RootState) => state.contribution.editing);
  const setStatus = (status: BuildingStatus) =>
    dispatch(Actions.contribution.setStatus(status));

  return editing ? (
    <Select
      label=""
      nativeSelectProps={{
        onChange: (event) => setStatus(event.target.value as BuildingStatus),
        value: status,
      }}
    >
      {Object.keys(BuildingStatusMap).map((status) => (
        <option key={status} value={status}>
          {BuildingStatusMap[status as BuildingStatus]}
        </option>
      ))}
    </Select>
  ) : (
    BuildingStatusMap[currentStatus]
  );
}
