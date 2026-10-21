'use client';

// Copie de @private-captcha/private-captcha-react 0.0.8 (licence MIT). Le paquet
// publie ce composant en TSX brut, ce qui fait planter Turbopack en dev.
import { useEffect, useRef, useState } from 'react';
import { CaptchaWidget } from '@private-captcha/private-captcha-js-core';

type CaptchaEventDetail = {
  widget: any;
  element: HTMLElement;
};

type PrivateCaptchaProps = {
  siteKey: string;
  onInit?: (detail: CaptchaEventDetail) => void;
  onError?: (detail: CaptchaEventDetail) => void;
  onStart?: (detail: CaptchaEventDetail) => void;
  onFinish?: (detail: CaptchaEventDetail) => void;
  theme?: 'light' | 'dark';
  startMode?: 'click' | 'auto';
  debug?: boolean;
  fieldName?: string;
  puzzleEndpoint?: string;
  displayMode?: 'widget' | 'popup' | 'hidden';
  lang?: string;
  styles?: string;
  storeVariable?: string;
  eu?: boolean;
  compat?: 'recaptcha';
};

const EVENTS = {
  'privatecaptcha:init': 'onInit',
  'privatecaptcha:error': 'onError',
  'privatecaptcha:start': 'onStart',
  'privatecaptcha:finish': 'onFinish',
} as const;

export const PrivateCaptcha = (props: PrivateCaptchaProps) => {
  const { siteKey, onInit, onError, onStart, onFinish, ...widgetOptions } =
    props;
  const captchaRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded || !captchaRef.current) return;
    setIsLoaded(true);

    const filteredOptions = Object.fromEntries(
      Object.entries(widgetOptions).filter(([, value]) => value !== undefined),
    );

    new CaptchaWidget(captchaRef.current, filteredOptions);
  }, [isLoaded, captchaRef, widgetOptions]);

  useEffect(() => {
    const element = captchaRef.current;
    if (!element) return;

    const handlers = { onInit, onError, onStart, onFinish };
    const listeners = Object.entries(EVENTS).map(([event, handler]) => {
      const listener = (e: Event) =>
        handlers[handler]?.((e as CustomEvent<CaptchaEventDetail>).detail);
      element.addEventListener(event, listener);
      return () => element.removeEventListener(event, listener);
    });

    return () => listeners.forEach((remove) => remove());
  }, [onInit, onError, onStart, onFinish]);

  const dataAttributes: Record<string, string | boolean> = {
    'data-sitekey': siteKey,
  };
  if (props.theme) dataAttributes['data-theme'] = props.theme;
  if (props.startMode) dataAttributes['data-start-mode'] = props.startMode;
  if (props.debug !== undefined) dataAttributes['data-debug'] = props.debug;
  if (props.fieldName) dataAttributes['data-solution-field'] = props.fieldName;
  if (props.puzzleEndpoint)
    dataAttributes['data-puzzle-endpoint'] = props.puzzleEndpoint;
  if (props.displayMode)
    dataAttributes['data-display-mode'] = props.displayMode;
  if (props.lang) dataAttributes['data-lang'] = props.lang;
  if (props.styles) dataAttributes['data-styles'] = props.styles;
  if (props.storeVariable)
    dataAttributes['data-store-variable'] = props.storeVariable;
  if (props.eu !== undefined) dataAttributes['data-eu'] = props.eu;

  return (
    <div ref={captchaRef} className="private-captcha" {...dataAttributes} />
  );
};
