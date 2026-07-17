'use client';

import styles from '@/styles/welcomePanel.module.scss';
import { useEffect, useState } from 'react';
import React from 'react';
import useQueryParamState from '@/utils/useQueryParamState';
// @ts-ignore
import Cookies from 'js-cookie';

export interface HelpSlide {
  title: string;
  content: React.ReactNode;
}

export interface HelpVariation {
  /** Value of the `from` query param / cookie identifying this source. */
  from: string;
  /** Label of the button that reopens the modal over the map. */
  triggerLabel: string;
  /** Referrer domain that auto-selects this source on /carte. */
  referrer: string;
  slides: HelpSlide[];
}

/**
 * Every piece of copy shown to a visitor, per source. This is the single place
 * to edit the welcome modals; the components below only receive it as props.
 * Slides are spelled out per variation on purpose, so wording can diverge
 * between sources without untangling shared fragments.
 */
export const HELP_VARIATIONS: HelpVariation[] = [
  {
    from: 'RNC',
    triggerLabel: 'Aide pour les représentants de copropriété',
    referrer: 'registre-coproprietes.gouv.fr',
    slides: [
      {
        title:
          'Représentant d’une copropriété, vous venez du Registre National des Copropriétés',
        content: (
          <>
            <p>
              Bienvenue sur le Référentiel National des Bâtiments (RNB). Il
              répertorie tous les bâtiments de France.
            </p>

            <p>
              <b>
                Les bâtiments présentés sur le Registre National des
                Copropriétés (RNC) sont directement issus du RNB.
              </b>
            </p>

            <p>
              Vous constatez une mauvaise information sur un bâtiment ? Vous
              pouvez directement éditer les bâtiments de votre copropriété
              depuis ce site.
            </p>
          </>
        ),
      },
      {
        title: 'Comment modifier des bâtiments dans le RNB',
        content: (
          <>
            <p>
              La fonction <b>« Éditer le RNB »</b> vous permet de mettre au
              propre votre copropriété :
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

            <div className={styles.connexionBlock}>
              <p>Prochaines étapes</p>
              <ol>
                <li>Vérifier les bâtiments de ma copropriété</li>
                <li>
                  En cas d’erreur : créer un compte RNB et corriger les erreurs
                </li>
              </ol>
            </div>
          </>
        ),
      },
    ],
  },
  {
    from: 'PrioReno',
    triggerLabel: 'Aide pour les bailleurs sociaux venant de PrioRéno LS',
    referrer: 'banquedesterritoires.fr',
    slides: [
      {
        title: 'Bailleur social, vous venez de PrioRéno LS',
        content: (
          <>
            <p>
              Bienvenue sur le Référentiel National des Bâtiments (RNB). Il
              répertorie tous les bâtiments de France.
            </p>

            <p>
              <b>
                Les bâtiments présentés dans PrioRéno LS sont directement issus
                du RNB.
              </b>
            </p>

            <p>
              Vous constatez une mauvaise information sur un bâtiment ? Vous
              pouvez directement éditer les bâtiments de votre parc depuis ce
              site.
            </p>
          </>
        ),
      },
      {
        title: 'Comment modifier des bâtiments dans le RNB',
        content: (
          <>
            <p>
              La fonction <b>« Éditer le RNB »</b> vous permet de mettre au
              propre votre parc :
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

            <div className={styles.connexionBlock}>
              <p>Prochaines étapes</p>
              <ol>
                <li>Vérifier les bâtiments de mon parc</li>
                <li>
                  En cas d’erreur : créer un compte RNB et corriger les erreurs
                </li>
              </ol>
            </div>
          </>
        ),
      },
    ],
  },
  {
    from: 'IPPER',
    triggerLabel: 'Aide pour les collectivités venant d’IPPER',
    referrer: 'programme-cee-actee.fr',
    slides: [
      {
        title: 'Collectivités, vous venez d’IPPER',
        content: (
          <>
            <p>
              Bienvenue sur le Référentiel National des Bâtiments (RNB). Il
              répertorie tous les bâtiments de France.
            </p>

            <p>
              <b>
                Les bâtiments présentés dans IPPER sont directement issus du
                RNB.
              </b>
            </p>

            <p>
              Vous constatez une mauvaise information sur un bâtiment ? Vous
              pouvez directement éditer les bâtiments de votre parc depuis ce
              site.
            </p>
          </>
        ),
      },
      {
        title: 'Comment modifier des bâtiments dans le RNB',
        content: (
          <>
            <p>
              La fonction <b>« Éditer le RNB »</b> vous permet de mettre au
              propre votre parc :
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

            <div className={styles.connexionBlock}>
              <p>Prochaines étapes</p>
              <ol>
                <li>Vérifier les bâtiments de mon parc</li>
                <li>
                  En cas d’erreur : créer un compte RNB et corriger les erreurs
                </li>
              </ol>
            </div>
          </>
        ),
      },
    ],
  },
];

export function getHelpVariation(
  from: string | undefined,
): HelpVariation | undefined {
  return HELP_VARIATIONS.find((variation) => variation.from === from);
}

const FROM_COOKIE = 'rnb_welcome_from';
const OPEN_COOKIE = 'rnb_welcome_modal_open';
const COOKIE_OPTIONS = { expires: 365 };

/**
 * Resolves which welcome variation the visitor should see, in priority order:
 * the `from` query param, then the referrer they arrived from, then the cookie
 * left by a previous visit.
 *
 * An explicit `from` always wins: a referrer never overrides a URL the visitor
 * was sent to on purpose.
 */
export function useHelpVariation(): {
  variation: HelpVariation | undefined;
  defaultOpen: boolean;
} {
  const [from, setFrom] = useQueryParamState('from', '');

  useEffect(() => {
    if (from) return;

    const referred = HELP_VARIATIONS.find((variation) =>
      document.referrer.includes(variation.referrer),
    );
    if (!referred) return;

    setFrom(referred.from);
    Cookies.set(FROM_COOKIE, referred.from, COOKIE_OPTIONS);

    // Only auto-open the first time. Once the visitor has closed the modal the
    // cookie holds 'false', and coming back through the referrer again must not
    // re-open it.
    if (Cookies.get(OPEN_COOKIE) === undefined) {
      Cookies.set(OPEN_COOKIE, 'true', COOKIE_OPTIONS);
    }
  }, [from, setFrom]);

  return {
    variation: getHelpVariation(from || Cookies.get(FROM_COOKIE)),
    defaultOpen: Cookies.get(OPEN_COOKIE) === 'true',
  };
}

interface HelpSourceModalBodyProps {
  slides: HelpSlide[];
  currentPage: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

/**
 * Inner markup of the modal, shared with the /check-welcome preview page so
 * both render identically.
 */
export function HelpSourceModalBody({
  slides,
  currentPage,
  onPrev,
  onNext,
  onClose,
}: HelpSourceModalBodyProps) {
  const slide = slides[currentPage];
  const isFirst = currentPage === 0;
  const isLast = currentPage === slides.length - 1;

  return (
    <div className="fr-modal__body">
      <div className="fr-modal__header">
        <button
          aria-controls="modal-0"
          title="Fermer"
          type="button"
          onClick={onClose}
          id="button-5"
          className="fr-btn--close fr-btn"
        >
          Fermer
        </button>
      </div>
      <div className="fr-modal__content">
        <h1 id="modal-0-title" className="fr-modal__title">
          {slide.title}
        </h1>

        <div>{slide.content}</div>
      </div>
      <div className="fr-modal__footer">
        <div className="fr-btns-group fr-btns-group--between fr-btns-group--inline">
          {!isFirst ? (
            <button className="fr-btn fr-btn--secondary" onClick={onPrev}>
              ← Précédent
            </button>
          ) : (
            <span />
          )}
          <button
            className="fr-btn"
            aria-controls={isLast ? 'modal-0' : undefined}
            onClick={onNext}
          >
            {isLast ? 'Consulter la carte' : 'Comment éditer le RNB'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface HelpSourcePanelProps {
  defaultOpen: boolean;
  variation: HelpVariation;
}

export default function HelpSourcePanel({
  defaultOpen,
  variation,
}: HelpSourcePanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [currentPage, setCurrentPage] = useState(0);

  const handleClose = () => {
    setIsOpen(false);
    setCurrentPage(0);
    Cookies.set(OPEN_COOKIE, 'false', COOKIE_OPTIONS);
  };

  const isLast = currentPage === variation.slides.length - 1;

  return (
    <>
      <button
        aria-controls="modal-0"
        type="button"
        data-fr-opened={isOpen ? 'true' : 'false'}
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
      >
        {variation.triggerLabel}
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
              <HelpSourceModalBody
                slides={variation.slides}
                currentPage={currentPage}
                onPrev={() => setCurrentPage((p) => p - 1)}
                onNext={() =>
                  isLast ? handleClose() : setCurrentPage((p) => p + 1)
                }
                onClose={handleClose}
              />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
