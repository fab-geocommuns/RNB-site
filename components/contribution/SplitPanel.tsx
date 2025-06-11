import { Actions, AppDispatch, RootState } from '@/stores/store';
import Button from '@codegouvfr/react-dsfr/Button';
import { Select } from '@codegouvfr/react-dsfr/SelectNext';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BuildingStatus from './BuildingStatus';
import { SplitChild } from '@/stores/edition/edition-slice';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import BuildingAddresses from './BuildingAddresses';
import { BuildingAddress } from '@/stores/map/map-slice';
import { BuildingAddressType } from './types';

const INITIAL_STEP = 0;

export default function SplitPanel() {
  const dispatch: AppDispatch = useDispatch();
  const splitCandidateId = useSelector(
    (state: RootState) => state.edition.split.splitCandidateId,
  );
  const splitChildrenN = useSelector(
    (state: RootState) => state.edition.split.childrenNumber,
  );
  const children: SplitChild[] = useSelector(
    (state: RootState) => state.edition.split.children,
  );
  const location = useSelector(
    (state: RootState) => state.edition.split.location,
  );
  const stepsN: number = splitChildrenN + 1;
  const [currentStep, setCurrentStep] = useState(0);
  const currentChild = currentStep - 1;

  const setChildrenNumber = (n: string) => {
    dispatch(Actions.edition.setSplitChildrenNumber(parseInt(n)));
  };

  const nextStep = () => {
    if (currentStep < stepsN - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > INITIAL_STEP) {
      setCurrentStep(currentStep - 1);
    }
  };

  const setStatus = (currentChild: number, status: BuildingStatusType) => {
    dispatch(
      Actions.edition.setSplitChildStatus({
        childIndex: currentChild,
        status: status,
      }),
    );
  };
  const setAddresses = (
    currentChild: number,
    addresses: BuildingAddressType[],
  ) => {
    dispatch(
      Actions.edition.setSplitAddresses({
        childIndex: currentChild,
        addresses: addresses,
      }),
    );
  };

  return (
    <>
      {currentStep === INITIAL_STEP && (
        <>
          coucou split split candidate : {splitCandidateId}
          <Select
            nativeSelectProps={{
              value: splitChildrenN?.toString(),
              onChange: (event) => {
                setChildrenNumber(event.target.value);
              },
            }}
            label=""
            options={[
              { value: '2', label: 2 },
              { value: '3', label: 3 },
              { value: '4', label: 4 },
              { value: '5', label: 5 },
              { value: '6', label: 6 },
              { value: '7', label: 7 },
              { value: '8', label: 8 },
              { value: '9', label: 9 },
            ]}
          />
          {splitChildrenN}
        </>
      )}

      {currentStep > INITIAL_STEP && (
        <>
          <div>
            Batiment {currentStep} / {splitChildrenN}
          </div>
          <BuildingStatus
            status={children[currentChild].status}
            onChange={(status) => setStatus(currentChild, status)}
          ></BuildingStatus>
          {location}
          <BuildingAddresses
            buildingPoint={location!}
            addresses={children[currentChild].addresses}
            onChange={(addresses: BuildingAddressType[]) => {
              setAddresses(currentChild, addresses);
            }}
          />
        </>
      )}

      {currentStep > INITIAL_STEP && (
        <Button onClick={previousStep}>précédent</Button>
      )}
      <div></div>
      {currentStep < stepsN - 1 && <Button onClick={nextStep}>Suivant</Button>}
      {currentStep === stepsN - 1 && <Button onClick={nextStep}>FIN</Button>}
    </>
  );
}
