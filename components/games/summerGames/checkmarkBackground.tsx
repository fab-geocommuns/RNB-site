'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from '@/styles/summerGames.module.scss';

// Réglages du motif et de l'effet de peinture
const SPACING = 25; // espacement de la grille en px (plus petit = plus dense)
const CHECK_SIZE = 25; // taille d'une coche en px
const RADIUS = 25; // rayon du "pinceau" autour du curseur en px
const MIN_PAINT = 0.05; // seuil en deçà duquel on ne peint pas

// Durée avant extinction d'une coche après son dernier allumage (ms)
const FADE_DELAY = 10000;

// Couleurs de peinture (RGB) : proche du fond du bloc (#4059db) discret (loin)
// → bleu plus clair (près) pour rester dans la même gamme que le fond
const BLUE_SOFT = [90, 118, 230];
const BLUE_VIVID = [150, 175, 250];

// Path issu de public/icons/check-line.svg
const CHECK_PATH =
  'M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z';

type Point = { x: number; y: number };

function buildGrid(width: number, height: number): Point[] {
  if (width === 0 || height === 0) return [];
  const cols = Math.ceil(width / SPACING);
  const rows = Math.ceil(height / SPACING);
  // Centrage du motif dans le conteneur
  const offsetX = (width - (cols - 1) * SPACING) / 2;
  const offsetY = (height - (rows - 1) * SPACING) / 2;
  const points: Point[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      points.push({ x: offsetX + c * SPACING, y: offsetY + r * SPACING });
    }
  }
  return points;
}

export default function CheckmarkBackground() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(SVGSVGElement | null)[]>([]);
  // Niveau de peinture accumulé par coche (0 → 1), persistant
  const paintRef = useRef<Float32Array>(new Float32Array(0));
  // Timer d'extinction par coche (10 s après le dernier allumage)
  const fadeTimersRef = useRef<(ReturnType<typeof setTimeout> | null)[]>([]);
  const [points, setPoints] = useState<Point[]>([]);

  // Mesure du conteneur et (re)génération de la grille
  useLayoutEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const update = () => setPoints(buildGrid(el.clientWidth, el.clientHeight));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Éteint une coche : retour à l'état caché (transparent)
  const extinguish = (i: number) => {
    paintRef.current[i] = 0;
    const node = itemRefs.current[i];
    if (node) {
      node.style.opacity = '0';
      node.style.color = '';
    }
    const t = fadeTimersRef.current[i];
    if (t) {
      clearTimeout(t);
      fadeTimersRef.current[i] = null;
    }
  };

  // Peinture au curseur (persistant, puis extinction après FADE_DELAY)
  useEffect(() => {
    if (points.length === 0) return;
    const field = fieldRef.current;
    const shell = field?.parentElement;
    if (!field || !shell) return;

    const paint = new Float32Array(points.length);
    paintRef.current = paint;
    fadeTimersRef.current = new Array(points.length).fill(null);

    const onMove = (e: MouseEvent) => {
      const rect = field.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      for (let i = 0; i < points.length; i++) {
        const dx = mx - points[i].x;
        const dy = my - points[i].y;
        const dist = Math.hypot(dx, dy);
        const influence = Math.exp(-((dist / RADIUS) * (dist / RADIUS)));
        if (influence < MIN_PAINT) continue;
        // On ne peint que vers le haut : la peinture reste posée
        if (influence > paint[i] + 0.005) {
          paint[i] = influence;
          const node = itemRefs.current[i];
          if (node) {
            const p = influence;
            const r = Math.round(
              BLUE_SOFT[0] + (BLUE_VIVID[0] - BLUE_SOFT[0]) * p,
            );
            const g = Math.round(
              BLUE_SOFT[1] + (BLUE_VIVID[1] - BLUE_SOFT[1]) * p,
            );
            const b = Math.round(
              BLUE_SOFT[2] + (BLUE_VIVID[2] - BLUE_SOFT[2]) * p,
            );
            node.style.color = `rgb(${r}, ${g}, ${b})`;
            node.style.opacity = `${(0.45 + 0.55 * p).toFixed(3)}`;
          }
        }

        // (Ré)arme l'extinction 10 s après ce dernier allumage
        if (paint[i] > 0) {
          const existing = fadeTimersRef.current[i];
          if (existing) clearTimeout(existing);
          fadeTimersRef.current[i] = setTimeout(
            () => extinguish(i),
            FADE_DELAY,
          );
        }
      }
    };

    shell.addEventListener('mousemove', onMove);
    return () => {
      shell.removeEventListener('mousemove', onMove);
      for (let i = 0; i < fadeTimersRef.current.length; i++) {
        const t = fadeTimersRef.current[i];
        if (t) clearTimeout(t);
      }
      fadeTimersRef.current = [];
    };
  }, [points]);

  return (
    <div ref={fieldRef} className={styles.checkField} aria-hidden="true">
      {points.map((p, i) => (
        <svg
          key={i}
          ref={(node) => {
            itemRefs.current[i] = node;
          }}
          className={styles.check}
          viewBox="0 0 24 24"
          width={CHECK_SIZE}
          height={CHECK_SIZE}
          style={{ left: p.x, top: p.y }}
        >
          <path d={CHECK_PATH} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
