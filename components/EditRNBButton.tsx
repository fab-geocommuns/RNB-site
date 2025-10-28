'use client';

// Styles
import styles from '@/styles/editRNBButton.module.scss';

// Routes
import { usePathname, useSearchParams } from 'next/navigation';

export default function EditRNBButton({ modal }: any) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  let editUrl = '/edition';
  if (pathname === '/carte') {
    editUrl = `/edition?${searchParams.toString()}`;
  }

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
          aria-label="Aide à l'édition du RNB"
        >
          <i className="fr-icon fr-icon-question-line"></i>
        </a>
        <a href={editUrl} className={styles.editBtn}>
          Éditer le RNB
        </a>
      </span>
    </>
  );
}
