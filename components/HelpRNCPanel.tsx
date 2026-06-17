import { Stepper } from '@codegouvfr/react-dsfr/Stepper';
import styles from '@/styles/panelRNC.module.scss';
import { useState } from 'react';
// @ts-ignore
import Cookies from 'js-cookie';

interface HelpRNCPanelProps {
  defaultOpen: boolean;
  from: string;
}

type PageContent = Partial<Record<string, React.ReactNode>> | React.ReactNode;

interface Page {
  title: string;
  content: PageContent;
}

function resolveContent(content: PageContent, from: string): React.ReactNode {
  if (
    content &&
    typeof content === 'object' &&
    ('RNC' in content || 'RNF' in content || 'RGC' in content)
  ) {
    return (content as Partial<Record<string, React.ReactNode>>)[from] ?? null;
  }
  return content as React.ReactNode;
}

const PAGES = [
  {
    title: 'Bienvenue sur le Référentiel National des bâtiments (RNB)',
    content: {
      RNC: (
        <>
          <p>
            Vous êtes représentant d’une copropriété et venez du Registre
            National des Copropriétés.
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
          <p>Vous êtes bailleur social et venez de PrioRéno Logement Social.</p>
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
          <p>Vous êtes représentant d’une collectivité et venez d’IPPER.</p>
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
          Dans le Référentiel National des Bâtiments, vous pouvez modifier
          directement des bâtiments afin de corriger ou compléter leurs données.
          Objectif : disposer d’un référentiel au plus près de la réalité du
          terrain.
        </p>
        <p>
          La fonction <b>« Éditer le RNB »</b> vous permet de :
        </p>
        <ul>
          <li>créer un bâtiment nouvellement construit</li>
          <li>modifier les adresses associées</li>
          <li>fusionner ou scinder des bâtiments</li>
          <li>corriger la forme ou la position d’un bâtiment</li>
          <li>
            mettre à jour son statut ou désactiver un identifiant incorrect
          </li>
        </ul>
        <p>
          Vos modifications dans le RNB sont automatiquement prises en compte
          dans le Registre National des Copropriétés.
        </p>

        <p>Pour modifier un bâtiment, vous devez :</p>
        <ul>
          <li>
            <a href="https://rnb.beta.gouv.fr/login" target="_blank">
              créer un compte RNB
            </a>
          </li>
          <li>
            <a href="https://rnb.beta.gouv.fr/carte" target="_blank">
              utiliser la carte du RNB
            </a>{' '}
            pour éditer les données
          </li>
        </ul>

        <p>
          💡 Astuce : Consultez le{' '}
          <a
            href="https://rnb-fr.gitbook.io/documentation/guides/editer-le-rnb-dans-les-regles-de-lart"
            target="_blank"
          >
            guide d’édition
          </a>{' '}
          pour éditer dans les règles de l’art
        </p>
        <p>
          Vous pouvez aussi <b>signaler une erreur</b> : ces signalements ne
          sont pas pris en compte automatiquement dans les outils partenaires.
        </p>
      </>
    ),
  },
  {
    title: 'Avant de modifier : qu’est-ce qu’un bâtiment dans le RNB ?',
    content: (
      <>
        <p>
          Avant de modifier des données dans le RNB, assurez-vous de respecter
          la définition officielle du bâtiment, établie par le Conseil national
          de l’information géolocalisée (CNIG).
        </p>
        <p>
          “Construction souterraine et/ou au-dessus du sol, ayant pour objectif
          d&apos;être permanente, pour abriter des humains ou des activités
          humaines. Un bâtiment possède a minima un accès depuis l’extérieur.
          Dans la mesure du possible, un bâtiment est distinct d’un autre dès
          lors qu&apos;il est impossible de circuler entre eux.”
        </p>

        <p>
          👉 Plus d’informations{' '}
          <a href="https://rnb.beta.gouv.fr/definition" target="_blank">
            https://rnb.beta.gouv.fr/definition
          </a>
        </p>
      </>
    ),
  },
  {
    title: 'Inscris toi',
    content: (
      <>
        <p>
          Grâce à votre connaissance du terrain, vous aidez à rendre le
          Référentiel National des Bâtiments plus fiable et plus proche de la
          réalité.
        </p>
        <p>Pour commencer à modifier un bâtiment dans le RNB :</p>
        <ul>
          <li>
            <b>Créez un compte RNB :</b>{' '}
            <a href="https://rnb.beta.gouv.fr/login" target="_blank">
              https://rnb.beta.gouv.fr/login
            </a>
          </li>
          <li>
            Consultez le guide d’édition pour modifier dans les règles de l’art
            👉{' '}
            <a
              href="https://rnb-fr.gitbook.io/documentation/guides/editer-le-rnb-dans-les-regles-de-lart"
              target="_blank"
            >
              https://rnb-fr.gitbook.io/documentation/guides/editer-le-rnb-dans-les-regles-de-lart
            </a>
          </li>
        </ul>
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
