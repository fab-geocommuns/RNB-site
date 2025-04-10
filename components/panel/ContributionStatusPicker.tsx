import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  BuildingStatus,
  BuildingStatusMap,
} from '@/stores/contribution/contribution-types';
import React from 'react';
import Select from '@codegouvfr/react-dsfr/Select';
import { RNBGroup, useRNBAuthentication } from '@/utils/use-rnb-authentication';

type ContributionStatusPickerProps = {
  currentStatus: BuildingStatus;
};

export function ContributionStatusPicker({
  currentStatus,
}: ContributionStatusPickerProps) {
  const dispatch: AppDispatch = useDispatch();
  const status = useSelector((state: RootState) => state.contribution.status);
  const { is } = useRNBAuthentication();
  const setStatus = (status: BuildingStatus) =>
    dispatch(Actions.contribution.setStatus(status));

  return BuildingStatusMap[currentStatus];
}
