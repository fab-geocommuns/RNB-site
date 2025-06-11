import { Actions, AppDispatch, RootState } from '@/stores/store';
import Button from '@codegouvfr/react-dsfr/Button';
import { Select } from '@codegouvfr/react-dsfr/SelectNext';
import { useDispatch, useSelector } from 'react-redux';
import BuildingStatus from './BuildingStatus';
import { SplitChild } from '@/stores/edition/edition-slice';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import BuildingAddresses from './BuildingAddresses';
import { BuildingAddressType } from './types';
import newPolygonIcon from '@/public/images/map/edition/new_polygon.svg';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import { selectSplitChildrenForAPI } from '@/stores/edition/edition-selector';
import { toasterError, toasterSuccess } from './toaster';

const INITIAL_STEP = 0;

export default function SplitPanel() {
  const dispatch: AppDispatch = useDispatch();
  const { fetch } = useRNBFetch();
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
  const currentChildSelected = useSelector(
    (state: RootState) => state.edition.split.currentChildSelected,
  );
  const splitChildrenForAPI = useSelector(selectSplitChildrenForAPI);
  const setChildrenNumber = (n: string) => {
    dispatch(Actions.edition.setSplitChildrenNumber(parseInt(n)));
  };

  const nextStep = () => {
    const i = currentChildSelected === null ? -1 : currentChildSelected;
    if (i < splitChildrenN) {
      dispatch(Actions.edition.setCurrentChildSelected(i + 1));
    }
  };

  const previousStep = () => {
    const i = currentChildSelected || 0;

    if (i === 0) {
      dispatch(Actions.edition.setCurrentChildSelected(null));
    } else if (i > 0) {
      dispatch(Actions.edition.setCurrentChildSelected(i - 1));
    }
  };

  const setStatus = (status: BuildingStatusType) => {
    dispatch(Actions.edition.setSplitChildStatus(status));
  };
  const setAddresses = (addresses: BuildingAddressType[]) => {
    dispatch(Actions.edition.setSplitAddresses(addresses));
  };

  const handleSplitBuildingShapeCreation = () => {
    dispatch(Actions.edition.setShapeInteractionMode('drawing'));
  };

  const handleSubmit = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${splitCandidateId}/split/`;

    try {
      const response = await fetch(url, {
        body: JSON.stringify({ created_buildings: splitChildrenForAPI }),
        method: 'POST',
      });

      if (!response.ok) {
        // await throwErrorMessageForHumans(response);
      } else {
        // force the map to reload the building, to immediatly show the modifications made
        dispatch(Actions.map.reloadBuildings());
        // dispatch(Actions.edition.setBuildingNewShape(null));
        toasterSuccess(dispatch, 'Scission enregistrée');
        // await dispatch(Actions.map.selectBuilding(rnbId));
      }
    } catch (err: any) {
      toasterError(dispatch, err.message || 'Erreur lors de la scission');
      console.error(err);
    }
  };

  return (
    <>
      {currentChildSelected === null && (
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

      {currentChildSelected !== null && currentChildSelected >= 0 && (
        <>
          coucou
          <div>
            Batiment {currentChildSelected + 1} / {splitChildrenN}
          </div>
          <BuildingStatus
            status={children[currentChildSelected].status}
            onChange={(status) => setStatus(status)}
          ></BuildingStatus>
          {location}
          <BuildingAddresses
            buildingPoint={location!}
            addresses={children[currentChildSelected].addresses}
            onChange={(addresses: BuildingAddressType[]) => {
              setAddresses(addresses);
            }}
          />
          <Button
            size="small"
            onClick={handleSplitBuildingShapeCreation}
            priority={`tertiary`}
          >
            <img
              src={newPolygonIcon.src}
              width="30"
              title="Dessiner une nouvelle géométrie"
            ></img>
            <span className="fr-pl-2v" style={{ textAlign: 'left' }}>
              Dessiner la géométrie du bâtiment
            </span>
          </Button>
        </>
      )}

      {currentChildSelected !== null && (
        <Button onClick={previousStep}>précédent</Button>
      )}
      <div></div>
      {(currentChildSelected === null ||
        currentChildSelected < splitChildrenN - 1) && (
        <Button onClick={nextStep}>Suivant</Button>
      )}
      {currentChildSelected && currentChildSelected === splitChildrenN - 1 && (
        <Button onClick={handleSubmit}>FIN</Button>
      )}
    </>
  );
}
