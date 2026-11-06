import { PrivateCaptcha } from '@private-captcha/private-captcha-react';
import { useEffect, useRef, useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { Loader } from '@/components/Loader';

type Props = {
  onSolved: (solution: string) => void;
  style?: React.CSSProperties;
};

type Status = 'pending' | 'solved' | 'error';

const WIDGET_VARIABLE = 'privateCaptchaWidget';

export default function Captcha({ onSolved, style }: Props) {
  const [status, setStatus] = useState<Status>('pending');
  const container = useRef<HTMLDivElement>(null);

  // The hidden widget only starts by itself on a focusin of its form, already
  // past when it is mounted on user engagement, so it is started here.
  useEffect(() => {
    const widget =
      container.current?.querySelector<any>('.private-captcha')?.[
        WIDGET_VARIABLE
      ];
    widget?.execute();
  }, []);

  const handleFinish = (widget: any) => {
    setStatus('solved');
    onSolved(widget.solution());
  };

  return (
    <div ref={container} style={style}>
      <PrivateCaptcha
        storeVariable={WIDGET_VARIABLE}
        displayMode="hidden"
        siteKey={process.env.NEXT_PUBLIC_PRIVATE_CAPTCHA_SITEKEY!}
        onFinish={(e) => handleFinish(e.widget)}
        onError={() => setStatus('error')}
        styles="font-size: 0.85rem; width: 100%;"
        lang="fr"
      />
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
