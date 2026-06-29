import { Stepper } from '@codegouvfr/react-dsfr/Stepper';
import styles from '@/styles/panelRNC.module.scss';
import { useState } from 'react';
import React from 'react';
// @ts-ignore
import Cookies from 'js-cookie';

interface HelpRNCPanelProps {
  defaultOpen: boolean;
  from: string;
}

type PageContent = Partial<Record<string, React.ReactNode>> | React.ReactNode;

function resolveContent(content: PageContent, from: string): React.ReactNode {
  if (
    content &&
    typeof content === 'object' &&
    !React.isValidElement(content)
  ) {
    return (content as Partial<Record<string, React.ReactNode>>)[from] ?? null;
  }
  return content as React.ReactNode;
}

const PAGES = [
  {
    title: {
      RNC: 'Représentant d’une copropriété, vous venez du Registre National des Copropriétés',
      PrioReno:
        'Bienvenue utilisateur de PrioReno sur le Référentiel National des bâtiments (RNB)',
      IPPER:
        "Bienvenue utilisateur d'IPPER sur le Référentiel National des bâtiments (RNB)",
    },
    content: {
      RNC: (
        <>
          <p>
            Bienvenue sur le Référentiel National des Bâtiments (RNB). Il
            répertorie tous les bâtiments de France.
          </p>
          <p>
            Vous pouvez ici signaler une erreur sur un bâtiment et/ou la
            corriger directement dans le RNB.
          </p>
          <p>
            Vos modifications dans le RNB seront automatiquement prises en
            compte dans le Registre National des Copropriétés.
          </p>
        </>
      ),
      PrioReno: (
        <>
          <p>
            Bienvenue sur le Référentiel National des Bâtiments (RNB). Il
            répertorie tous les bâtiments de France.
          </p>
          <p>
            Vous pouvez ici signaler une erreur sur un bâtiment et/ou la
            corriger directement dans le RNB.
          </p>
          <p>
            Vos modifications dans le RNB seront automatiquement prises en
            compte dans votre outil PrioRéno Logement Social.
          </p>
        </>
      ),
      IPPER: (
        <>
          <p>
            Bienvenue sur le Référentiel National des Bâtiments (RNB). Il
            répertorie tous les bâtiments de France.
          </p>
          <p>
            Vous pouvez ici signaler une erreur sur un bâtiment et/ou la
            corriger directement dans le RNB.
          </p>
          <p>
            Vos modifications dans le RNB seront automatiquement prises en
            compte dans votre outil IPPER.
          </p>
        </>
      ),
    },
  },
  {
    title: 'Comment modifier des bâtiments dans le RNB',
    content: (
      <>
        <p>
          La fonction <b>« Éditer le RNB »</b> vous permet de :
        </p>
        <ul>
          <li>créer un bâtiment nouvellement construit</li>
          <li>modifier les adresses associées</li>
          <li>fusionner ou scinder des bâtiments</li>
          <li>corriger la forme ou la position d’un bâtiment</li>
        </ul>

        <p>
          👉 Consultez le{' '}
          <a
            href="https://rnb-fr.gitbook.io/documentation/guides/editer-le-rnb-dans-les-regles-de-lart"
            target="_blank"
          >
            guide d’édition
          </a>{' '}
          et la{' '}
          <a href="https://rnb.beta.gouv.fr/definition" target="_blank">
            définition du bâtiment
          </a>
        </p>

        <a
          href="https://rnb.beta.gouv.fr/edition"
          target="_blank"
          className={styles.connexionBlock}
        >
          Créer un compte pour modifier le RNB →
        </a>
      </>
    ),
  },
];

export default function HelpRNCPanel({ defaultOpen, from }: HelpRNCPanelProps) {
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

  const currentContent = resolveContent(page.content, from);
  const currentTitle = resolveContent(page.title, from);
  const nextTitle = !isLast
    ? resolveContent(PAGES[currentPage + 1].title, from)
    : undefined;

  return (
    <>
      <button
        aria-controls="modal-0"
        type="button"
        data-fr-opened={isOpen ? 'true' : 'false'}
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={'Informations ' + from}
        title={'Informations ' + from}
      >
        Aide pour {from}
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
                    title={currentTitle}
                    nextTitle={nextTitle}
                  />

                  <div>{currentContent}</div>
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
