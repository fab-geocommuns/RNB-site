import { Stepper } from '@codegouvfr/react-dsfr/Stepper';
import styles from '@/styles/panelRNC.module.scss';
import { useState } from 'react';
// @ts-ignore
import Cookies from 'js-cookie';

interface HelpRNCPanelProps {
  defaultOpen: boolean;
}

const PAGES = [
  {
    title: 'Bienvenue visiteur du RNB',
    content: (
      <>
        <p>Vous êtes au bon endroit pour modifier le RNB</p>
      </>
    ),
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

export default function HelpRNCPanel({ defaultOpen }: HelpRNCPanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [currentPage, setCurrentPage] = useState(0);

  const handleClose = () => {
    setIsOpen(false);
    setCurrentPage(0);
    Cookies.set('state', 'false', { expires: 365 });
  };

  const page = PAGES[currentPage];
  const isFirst = currentPage === 0;
  const isLast = currentPage === PAGES.length - 1;

  return (
    <>
      <button
        aria-controls="modal-0"
        type="button"
        data-fr-opened={isOpen ? 'true' : 'false'}
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Informations RNC"
      >
        ?
      </button>

      <dialog
        id="modal-0"
        className="fr-modal"
        aria-labelledby="modal-0-title"
        data-fr-opened={isOpen ? 'true' : 'false'}
      >
        <div className="fr-container fr-container--fluid fr-container-md">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
              <div className="fr-modal__body">
                <div className="fr-modal__header">
                  <button
                    aria-controls="modal-0"
                    title="Fermer"
                    type="button"
                    onClick={handleClose}
                    id="button-5"
                    className="fr-btn--close fr-btn"
                  >
                    Fermer
                  </button>
                </div>
                <div className="fr-modal__content">
                  <Stepper
                    currentStep={currentPage + 1}
                    stepCount={PAGES.length}
                    title={page.title}
                    nextTitle={
                      !isLast ? PAGES[currentPage + 1].title : undefined
                    }
                  />

                  <div>{page.content}</div>
                </div>
                <div className="fr-modal__footer">
                  <div className="fr-btns-group fr-btns-group--between fr-btns-group--inline">
                    {!isFirst ? (
                      <button
                        className="fr-btn fr-btn--secondary"
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        ← Précédent
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      className="fr-btn"
                      aria-controls={isLast ? 'modal-0' : undefined}
                      onClick={() => {
                        isLast ? handleClose() : setCurrentPage((p) => p + 1);
                      }}
                    >
                      {' '}
                      {isLast ? 'Fermer' : 'Suivant →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
