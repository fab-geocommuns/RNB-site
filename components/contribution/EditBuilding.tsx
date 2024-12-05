import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';

export function EditBuilding() {
  const dispatch: AppDispatch = useDispatch();
  const selectedBuilding = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const editing = useSelector((state: RootState) => state.contribution.editing);

  return (
    <div
      className="action"
      onClick={() => {
        dispatch(
          !editing
            ? Actions.contribution.startEdit(selectedBuilding)
            : Actions.contribution.stopEdit(),
        );
      }}
    >
      Modifier
    </div>
  );
}
