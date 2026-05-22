import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { MapPointer, mapActions } from '@/stores/map/map-slice';

type Props = {
  cursor: MapPointer;
};

export default function MapPointerClaim({ cursor }: Props) {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(mapActions.setPointer(cursor));
    return () => {
      dispatch(mapActions.setPointer(''));
    };
  }, [cursor, dispatch]);

  return null;
}
