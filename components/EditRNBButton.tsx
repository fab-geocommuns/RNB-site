// Styles
import styles from '@/styles/editRNBButton.module.scss';

export default function EditRNBButton({ modal }: any) {
  const explainBtnClickHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    modal.open();
  };

  return (
    <>
      <span className={styles.group}>
        <a
          href="#"
          className={styles.infoBtn}
          onClick={(e) => explainBtnClickHandler(e)}
        >
          <i className="fr-icon fr-icon-question-line"></i>
        </a>
        <a href="/edition" className={styles.editBtn}>
          Éditer le RNB
        </a>
      </span>
    </>
  );
}
