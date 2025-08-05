import styles from '@/styles/contribution/editPanel.module.scss';
import Button from '@codegouvfr/react-dsfr/Button';
import { useSelector, useDispatch } from 'react-redux';
import { Actions, RootState, AppDispatch } from '@/stores/store';
import { Operation } from '@/stores/edition/edition-slice';
interface ButtonProps {
  operationText: string;
  operationType: Operation;
  selectedImageSrc: string;
  imageSrc: string;
}
export default function EditionButton({
  operationText,
  operationType,
  selectedImageSrc,
  imageSrc,
}: ButtonProps) {
  const dispatch: AppDispatch = useDispatch();
  const operation = useSelector((state: RootState) => state.edition.operation);
  const toggleOperation = (operationName: Operation) => () => {
    if (operation === operationName) {
      dispatch(Actions.edition.setOperation(null));
    } else {
      dispatch(Actions.edition.setOperation(operationName));
    }
  };
  return (
    <>
      <Button
        onClick={toggleOperation(operationType)}
        className={operation === operationType ? styles.buttonSelected : ''}
        size="small"
        priority="tertiary no outline"
      >
        <div className={styles.action}>
          <img
            src={operation === operationType ? selectedImageSrc : imageSrc}
            alt=""
            height="32"
            width="32"
          />
          <small
            className={operation === operationType ? styles.actionSelected : ''}
          >
            {operationText}
          </small>
        </div>
      </Button>
    </>
  );
}
