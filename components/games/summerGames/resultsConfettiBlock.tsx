'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CreateTypes } from 'canvas-confetti';
import { fr } from '@codegouvfr/react-dsfr';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import styles from '@/styles/summerGames.module.scss';

// Final count of the summer game, frozen once the game ended.
const TOTAL_VALIDATIONS = 100580;
const COUNT_DURATION_MS = 1500;
const GAME_FONT = 'SummerGameTitle, sans-serif';

const { options: colors, decisions } = fr.colors.getHex({ isDark: false });

const RIBBON_COLORS = [
  colors.blueFrance.main525.default,
  colors.greenEmeraude.main632.default,
  colors.yellowTournesol.main731.default,
  colors.pinkTuile.main556.default,
];

const formatCount = (value: number) => value.toLocaleString('fr-FR');

const fireConfetti = (shoot: CreateTypes) => {
  const burst = {
    particleCount: 70,
    spread: 60,
    startVelocity: 45,
    ticks: 250,
    colors: RIBBON_COLORS,
  };
  shoot({ ...burst, angle: 60, origin: { x: 0, y: 1 } });
  shoot({ ...burst, angle: 120, origin: { x: 1, y: 1 } });
};

const loadConfetti = (canvas: HTMLCanvasElement) =>
  import('canvas-confetti').then(({ default: confetti }) =>
    confetti.create(canvas, { resize: true }),
  );

export default function ResultsConfettiBlock() {
  const figureRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Promise<CreateTypes | null>>(null);
  const [count, setCount] = useState(0);
  const [canReplay, setCanReplay] = useState(false);

  const celebrate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    confettiRef.current ??= loadConfetti(canvas).catch((error) => {
      console.error('Error loading confetti:', error);
      setCanReplay(false);
      return null;
    });
    void confettiRef.current.then((shoot) => shoot && fireConfetti(shoot));
  }, []);

  useEffect(() => {
    const figure = figureRef.current;
    if (
      !figure ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    setCanReplay(true);

    let frame = 0;

    const countUp = () => {
      let start: number | undefined;
      const step = (now: number) => {
        start ??= now;
        const progress = Math.min((now - start) / COUNT_DURATION_MS, 1);
        setCount(Math.round(TOTAL_VALIDATIONS * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        countUp();
        celebrate();
      },
      { threshold: 0.5 },
    );
    observer.observe(figure);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      void confettiRef.current?.then((shoot) => shoot?.reset());
    };
  }, [celebrate]);

  return (
    <section
      className="fr-px-2w fr-pt-4w fr-pb-2w fr-px-md-4w"
      style={{
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        backgroundColor: decisions.background.default.grey.default,
        border: `1px solid ${decisions.border.default.grey.default}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          height: fr.spacing('1v'),
        }}
      >
        {RIBBON_COLORS.map((color) => (
          <div key={color} style={{ flex: 1, backgroundColor: color }} />
        ))}
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
        <h2 className="fr-h4 fr-mb-2w">
          L&apos;été des validations est terminé
        </h2>
        <p className="fr-text--lg fr-mb-2w">
          <span
            ref={figureRef}
            aria-hidden="true"
            className="fr-display--md fr-mb-0"
            style={{
              display: 'block',
              fontFamily: GAME_FONT,
              color: colors.blueFrance.sun113_625.default,
            }}
          >
            <span className={styles.countStack}>
              <span className={styles.animatedCount}>{formatCount(count)}</span>
              <span className={styles.finalCount}>
                {formatCount(TOTAL_VALIDATIONS)}
              </span>
            </span>
          </span>
          <span className="fr-sr-only">{formatCount(TOTAL_VALIDATIONS)} </span>
          validations réalisées par la communauté
        </p>
        <p className="fr-text--bold fr-mb-2w">Merci à toutes et à tous !</p>
        <p
          className="fr-text--sm fr-mb-3w"
          style={{ color: decisions.text.mention.grey.default }}
        >
          Prochaine étape : l&apos;équipe RNB analyse vos validations pour
          consolider le référentiel, puis vous en présentera les enseignements
          lors du prochain GT Bâti du CNIG.
        </p>
        <ButtonsGroup
          inlineLayoutWhen="sm and up"
          alignment="center"
          buttons={[
            {
              children: 'Voir le classement',
              linkProps: { href: '/classement' },
              iconId: 'fr-icon-arrow-right-line',
              iconPosition: 'right',
            },
            ...(canReplay
              ? [
                  {
                    children: 'Encore des confettis',
                    priority: 'tertiary no outline' as const,
                    onClick: celebrate,
                  },
                ]
              : []),
          ]}
        />
      </div>
    </section>
  );
}
