import { useSelector, useDispatch } from 'react-redux';
import { Actions, RootState, AppDispatch } from '@/stores/store';
import { useEffect, useState } from 'react';
import { fetchBuilding } from '@/utils/request';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { formatCandidates } from '@/stores/edition/edition-slice';
export default function CreationPanel() {
  const dispatch: AppDispatch = useDispatch();
  const candidatesToMerge = useSelector(
    (state: RootState) => state.edition.merge.candidates,
  );
  const [data, setData] = useState<(SelectedBuilding | undefined)[] | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      if (candidatesToMerge.length) {
        const responses = await Promise.all(
          candidatesToMerge.map((candidate) => fetchBuilding(candidate)),
        );
        setData(responses);
      }
    };

    fetchData();
  }, [candidatesToMerge]);
  return (
    <>
      <div>
        <h1>Fusionner</h1>
        <span>Je sélectionne</span>
        <span>sur la carte les bâtiments que je souhaite fusionner</span>
      </div>
      {data?.length ? (
        data.map(
          (candidate) =>
            candidate && (
              <div key={candidate?.rnb_id}>
                <div>{candidate.rnb_id}</div>
                <div>{candidate.status}</div>
                {candidate.addresses.map((addresse) => (
                  <div>
                    <div>{addresse.source}</div>
                    <div>
                      <span>
                        {addresse.street_number} {addresse.street}{' '}
                        {addresse.city_zipcode} {addresse.city_name}
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => selectCandidateToRemove(candidate.rnb_id)}
                >
                  close
                </button>
              </div>
            ),
        )
      ) : (
        <div>Aucun batiment séléctioné</div>
      )}
    </>
  );

  function selectCandidateToRemove(rnbId: string) {
    const candidates =
      data?.filter((candidate) => candidate.rnb_id !== rnbId) || null;
    setData(candidates);
    dispatch(
      Actions.edition.setCandidates(formatCandidates(rnbId, candidatesToMerge)),
    );
  }
}
