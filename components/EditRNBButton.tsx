// Styles
import styles from '@/styles/editRNBButton.module.scss';

export default function EditRNBButton() {
  return (
    <>
      <span className={styles.group}>
        <a href="/edition" className={styles.editBtn}>
          Éditer le RNB
        </a>
        <span className={styles.infoBtn}>
          <i className="fr-icon fr-icon-question-line"></i>
        </span>
      </span>
    </>
  );
}
