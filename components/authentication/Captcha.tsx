// The widget comes from js-core, not @private-captcha/private-captcha-react:
// that package ships raw TSX, which crashes Turbopack.
import { CaptchaWidget } from '@private-captcha/private-captcha-js-core';
import { useEffect, useRef, useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { Loader } from '@/components/Loader';

type Props = {
  onSolved: (solution: string) => void;
  style?: React.CSSProperties;
};

type Status = 'pending' | 'solved' | 'error';

export default function Captcha({ onSolved, style }: Props) {
  const [status, setStatus] = useState<Status>('pending');
  const widgetElement = useRef<HTMLDivElement>(null);
  const widget = useRef<CaptchaWidget | null>(null);

  useEffect(() => {
    const element = widgetElement.current;
    if (!element) return;

    const handleFinish = (event: Event) => {
      setStatus('solved');
      onSolved((event as CustomEvent).detail.widget.solution());
    };
    const handleError = () => setStatus('error');

    element.addEventListener('privatecaptcha:finish', handleFinish);
    element.addEventListener('privatecaptcha:error', handleError);
    return () => {
      element.removeEventListener('privatecaptcha:finish', handleFinish);
      element.removeEventListener('privatecaptcha:error', handleError);
    };
  }, [onSolved]);

  useEffect(() => {
    // The ref keeps Strict Mode from creating a second widget.
    if (!widgetElement.current || widget.current) return;
    widget.current = new CaptchaWidget(widgetElement.current, {
      sitekey: process.env.NEXT_PUBLIC_PRIVATE_CAPTCHA_SITEKEY!,
      displayMode: 'hidden',
      styles: 'font-size: 0.85rem; width: 100%;',
      lang: 'fr',
    });
    // The hidden widget only starts by itself on a focusin of its form, already
    // past when it is mounted on user engagement, so it is started here.
    widget.current.execute();
  }, []);

  return (
    <div style={style}>
      <div ref={widgetElement} />
      {status === 'pending' && (
        <small
          className={fr.cx('fr-hint-text', 'fr-mt-0')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Loader inline />
          Vérification de votre navigateur en cours…
        </small>
      )}
      {status === 'error' && (
        <small className={fr.cx('fr-error-text', 'fr-mt-0')}>
          La vérification du navigateur a échoué. Merci de contacter le support.
        </small>
      )}
      {status === 'solved' && (
        <small className={fr.cx('fr-valid-text', 'fr-mt-0')}>
          Vérification du navigateur réussie
        </small>
      )}
    </div>
  );
}
