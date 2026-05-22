import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import { MapPointer } from '@/stores/map/map-slice';

type Props = {
  cursor: MapPointer;
};

export default function MapPointerClaim({ cursor }: Props) {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(Actions.map.setPointer(cursor));
    return () => {
      dispatch(Actions.map.setPointer(''));
    };
  }, [cursor, dispatch]);

  return null;
}
