import { useState } from 'react';
import styles from '@/styles/panelRNC.module.scss';

const PAGES = [
  {
    title: 'Bienvenue visiteur du RNB',
    content: 'Vous êtes au bon endroit pour modifier le RNB',
  },
  {
    title: 'Comment créer des bâtiments',
    content:
      'Vous pouvez créer des bâtiments, corriger une adresse, démolir, etc',
  },
  {
    title: "Définition d'un bâtiment",
    content: 'Attention voilà la définition',
  },
  {
    title: 'Inscris toi',
    content: 'Pour pouvoir faire tout ça !',
  },
];

export default function HelpRNCPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const handleClose = () => {
    setIsOpen(false);
    setCurrentPage(0);
  };

  const page = PAGES[currentPage];
  const isFirst = currentPage === 0;
  const isLast = currentPage === PAGES.length - 1;

  return (
    <>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Informations RNC"
      >
        ?
      </button>
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>

            <span className={styles.badge}>
              RNC - {currentPage + 1} / {PAGES.length}
            </span>
            <h3 className={styles.title}>{page.title}</h3>
            <p className={styles.content}>{page.content}</p>

            <div className={styles.navigation}>
              <button
                className={styles.navBtn}
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={isFirst}
              >
                ← Précédent
              </button>

              <button
                className={styles.navBtn}
                onClick={
                  isLast ? handleClose : () => setCurrentPage((p) => p + 1)
                }
              >
                {isLast ? 'Fermer' : 'Suivant →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
