import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';

export default function CreationPanel() {
  const candidatesToMerge = useSelector(
    (state: RootState) => state.edition.merge.candidates,
  );
  return (
    <>
      {candidatesToMerge.length ? (
        candidatesToMerge.map((candidate) => (
          <div key={candidate.rnbId}>
            <div>{candidate.rnbId}</div>
            <div>{candidate.status}</div>
          </div>
        ))
      ) : (
        <div>Aucun batiment séléctioné</div>
      )}
    </>
  );
}
