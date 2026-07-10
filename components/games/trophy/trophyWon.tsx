import styles from '@/styles/trophyWon.module.scss';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import confetti from 'canvas-confetti';
import Button from '@codegouvfr/react-dsfr/Button';
import Medal from '@/components/games/summerGames/Medal';
import { trophyImageUrl, trophyMedalColor } from '@/utils/trophies';
import { Actions, AppDispatch, RootState } from '@/stores/store';

const trophyWonModal = createModal({
  id: 'trophy-won-modal',
  isOpenedByDefault: false,
});

// Diamètre de médaille : maximum quand on ne gagne qu'un trophée, réduit
// automatiquement pour que plusieurs trophées tiennent dans la modale.
const MAX_MEDAL_SIZE = 260;
const MIN_MEDAL_SIZE = 96;
// Place réservée sous chaque médaille pour le libellé du trophée (nom + marge).
const LABEL_HEIGHT = 76;

/**
 * Plus grand diamètre de médaille (carrée) permettant de disposer `count`
 * trophées dans une grille qui tient dans `width` × `height`, borné à
 * [MIN_MEDAL_SIZE, MAX_MEDAL_SIZE]. On teste chaque nombre de colonnes possible
 * et on retient celui qui autorise les plus grosses médailles.
 */
function fitMedalSize(
  count: number,
  width: number,
  height: number,
  gap: number,
): number {
  let best = 0;
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const cellW = (width - (cols - 1) * gap) / cols;
    const cellH = (height - (rows - 1) * gap) / rows - LABEL_HEIGHT;
    best = Math.max(best, Math.min(cellW, cellH));
  }
  return Math.round(Math.min(MAX_MEDAL_SIZE, Math.max(MIN_MEDAL_SIZE, best)));
}

/**
 * Modale de félicitations affichée lorsqu'un utilisateur gagne un ou plusieurs
 * trophées. Elle est montée une seule fois à un endroit stable de l'arbre (cf.
 * `useMap`) et pilotée par le store : le composant qui détecte le gain (ex.
 * `ValidationToggler`) peut être démonté par l'action qui fait gagner le
 * trophée sans empêcher l'affichage.
 */
export default function TrophyWon() {
  const dispatch: AppDispatch = useDispatch();
  const trophies = useSelector((state: RootState) => state.app.wonTrophies);

  // À la fermeture de la modale, on vide les trophées gagnés. Sans ce reset,
  // `wonTrophies` resterait non-vide et un éventuel remontage de ce composant
  // rejouerait la modale (l'effet d'ouverture s'exécute au montage dès que la
  // liste n'est pas vide). C'est aussi ce qui garantit qu'un même gain n'ouvre
  // la modale qu'une seule fois.
  useIsModalOpen(trophyWonModal, {
    onConceal: () => {
      dispatch(Actions.app.setWonTrophies([]));
    },
  });

  const listRef = useRef<HTMLUListElement>(null);
  const [medalSize, setMedalSize] = useState(MAX_MEDAL_SIZE);

  // Adapte la taille des médailles à la largeur réellement disponible dans la
  // modale et à la hauteur de l'écran, pour que tous les trophées gagnés
  // tiennent sans être rognés (la modale n'ayant pas de défilement vertical).
  useEffect(() => {
    const list = listRef.current;
    if (list === null || trophies.length === 0) return;

    const measure = () => {
      const availWidth = list.clientWidth;
      // Tant que la modale est masquée (display:none), la largeur est nulle : on
      // ne calcule rien, l'observer relancera la mesure à l'ouverture.
      if (availWidth < 50) return;
      const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
      const availHeight = window.innerHeight * 0.62;
      setMedalSize(fitMedalSize(trophies.length, availWidth, availHeight, gap));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    measure();
    return () => observer.disconnect();
  }, [trophies]);

  const confettiCount = 400;
  const scalar = 2;
  var checks = confetti.shapeFromText({ text: '✅', scalar });
  var stars = confetti.shapeFromText({ text: '⭐️', scalar });
  const confettiDefaults = {
    shapes: [checks, stars],
    origin: { x: 0.5, y: 0.7 },
    zIndex: 1751,
    scalar,
  };
  const fire = function (particleRatio: number, opts: any) {
    confetti({
      ...confettiDefaults,
      ...opts,
      particleCount: Math.floor(confettiCount * particleRatio),
    });
  };

  useEffect(() => {
    // On n'ouvre la modale que lorsqu'elle est effectivement rendue (mêmes
    // conditions que le garde de rendu ci-dessous). Sinon `trophyWonModal.open()`
    // appelle `window.dsfr(null).modal` sur un élément absent du DOM et plante.
    if (trophies.length === 0) return;

    const timer = setTimeout(() => {
      trophyWonModal.open();

      // Trigger confetti
      setTimeout(() => {
        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        });
        fire(0.2, {
          spread: 60,
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 145,
        });
      }, 50);
    }, 300);
    return () => clearTimeout(timer);
  }, [trophies]);

  if (trophies.length === 0) {
    return null;
  }

  const title =
    trophies.length > 1
      ? 'Vous avez gagné des trophées !'
      : 'Vous avez gagné un trophée !';

  return (
    <>
      <trophyWonModal.Component
        concealingBackdrop={false}
        title={title}
        size={trophies.length > 1 ? 'large' : 'medium'}
        className={styles.trophyModal}
      >
        <div className={styles.trophyContainer} data-testid="trophy-won">
          <ul className={styles.trophyList} ref={listRef}>
            {trophies.map((trophy) => (
              <li
                key={`${trophy.trophy}-${trophy.level}`}
                className={styles.trophyItem}
                style={{ width: medalSize }}
              >
                {/* Le visuel du trophée est fixe ; le palier atteint est rendu
                    par la couleur de la médaille (bronze / argent / or). */}
                <Medal
                  color={trophyMedalColor(trophy.level)}
                  image={trophyImageUrl(trophy)}
                  size={medalSize}
                  alt={`${trophy.trophy_label} — ${trophy.level_label}`}
                />
                <p
                  className={styles.trophyName}
                  style={{ fontSize: `${Math.max(0.9, medalSize / 118)}rem` }}
                >
                  {trophy.trophy_label}
                </p>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Button
              priority="secondary"
              size="small"
              linkProps={{
                href: '/mon-compte/mes-trophees',
              }}
              className={styles.actionBtn}
            >
              Voir mes trophées
            </Button>
          </div>
        </div>
      </trophyWonModal.Component>
    </>
  );
}
