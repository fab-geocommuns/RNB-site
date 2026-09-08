'use client';

import { useEffect, useRef, useState } from 'react';

// Clé publique Cloudflare Turnstile du formulaire Brevo "Inscription
// newsletter site", définie dans les variables d'environnement Vercel.
// Absente, le captcha est simplement désactivé.
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_BREVO_TURNSTILE_SITEKEY;

// `render=explicit` désactive le scan automatique du DOM par Turnstile : il
// monte sinon le widget avant l'hydratation React, qui le supprime aussitôt en
// réconciliant un conteneur qu'elle croit vide.
export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const POLL_INTERVAL_MS = 100;
const LOAD_TIMEOUT_MS = 10_000;

type RenderOptions = {
  sitekey: string;
  size?: 'flexible';
  callback?: () => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: RenderOptions) => string | undefined;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

/** `pending` couvre le chargement, la résolution et l'attente d'interaction. */
export type TurnstileState = 'pending' | 'solved' | 'error';

export function useTurnstile() {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>(undefined);
  const [state, setState] = useState<TurnstileState>('pending');

  // Le script est chargé par app/layout.tsx : on attend qu'il expose
  // window.turnstile avant de monter le widget.
  useEffect(() => {
    const el = container.current;
    if (!TURNSTILE_SITE_KEY || !el) return;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (!window.turnstile) {
        if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
          clearInterval(timer);
          setState('error');
        }
        return;
      }

      clearInterval(timer);
      try {
        widgetId.current = window.turnstile.render(el, {
          sitekey: TURNSTILE_SITE_KEY,
          // Prend la largeur du conteneur, donc celle du champ et du bouton.
          size: 'flexible',
          callback: () => setState('solved'),
          'error-callback': () => setState('error'),
          'expired-callback': () => setState('pending'),
        });
      } catch {
        // render() lève si la clé est invalide ou le domaine non autorisé.
        setState('error');
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    };
  }, []);

  const reset = () => {
    if (!widgetId.current) return;
    setState('pending');
    window.turnstile?.reset(widgetId.current);
  };

  return { container, state, reset };
}
