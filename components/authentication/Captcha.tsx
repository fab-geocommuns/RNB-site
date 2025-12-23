import { PrivateCaptcha } from '@private-captcha/private-captcha-react';
import { useState } from 'react';
import { Loader } from '@/components/Loader';
import { Tooltip } from '@codegouvfr/react-dsfr/Tooltip';
import { fr } from '@codegouvfr/react-dsfr';

type Props = {
  onSolved: (solution: string) => void;
  style?: React.CSSProperties;
};

export default function Captcha({ onSolved, style }: Props) {
  const startCaptcha = (widget: any) => {
    widget.execute();
  };
  const handleFinish = (widget: any) => {
    setStatus('solved');
    onSolved(widget.solution());
  };
  const [status, setStatus] = useState<
    'not_started' | 'ongoing' | 'solved' | 'error'
  >('not_started');
  return (
    <div style={style}>
      <PrivateCaptcha
        displayMode="hidden"
        siteKey={process.env.NEXT_PUBLIC_PRIVATE_CAPTCHA_SITEKEY!}
        onFinish={(e) => handleFinish(e.widget)}
        onInit={(e) => startCaptcha(e.widget)}
        onStart={() => setStatus('ongoing')}
        onError={() => setStatus('error')}
        styles="font-size: 0.85rem; width: 100%;"
        lang="fr"
      />
      {status === 'ongoing' && (
        <Tooltip
          title={
            <>
              Nous vérifions que vous êtes un humain en exécutant un test de
              sécurité.
              <br />
              Cela ne devrait pas prendre plus de quelques secondes.
            </>
          }
        >
          <small className={fr.cx('fr-hint-text', 'fr-mt-0')}>
            Vérification de votre navigateur en cours…
          </small>
        </Tooltip>
      )}
      {status === 'error' && (
        <Tooltip
          title={
            <>
              Une erreur est survenue lors de la vérification du captcha et nous
              n&apos;avons pas pu vérifier que vous êtes un humain.
              <br />
              Veuillez réessayer ou nous contacter à l&apos;adresse e-mail
              rnb@beta.gouv.fr si le problème persiste.
            </>
          }
        >
          <small className={fr.cx('fr-error-text', 'fr-mt-0')}>
            Une erreur est survenue lors de la vérification du captcha
          </small>
        </Tooltip>
      )}
      {status === 'solved' && (
        <Tooltip
          title={
            <>
              Nous avons vérifié que vous êtes un humain en exécutant un test de
              sécurité.
            </>
          }
        >
          <small className={fr.cx('fr-valid-text', 'fr-mt-0')}>
            Vérification du navigateur réussie
          </small>
        </Tooltip>
      )}
    </div>
  );
}
