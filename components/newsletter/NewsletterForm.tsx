'use client';

import styles from '@/styles/newsletter.module.scss';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { useState } from 'react';
import Captcha from '@/components/authentication/Captcha';
import { subscribeToNewsletter } from './subscribe';

type Props = {
  formId?: string;
};

const captchaEnabled = !!process.env.NEXT_PUBLIC_PRIVATE_CAPTCHA_SITEKEY;

export default function NewsletterForm({ formId = 'newsletter-form' }: Props) {
  const [captchaSolution, setCaptchaSolution] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = new FormData(e.currentTarget).get('email') as string;

    setSubmitting(true);
    setFeedback(null);

    const error = await subscribeToNewsletter(email, captchaSolution);

    setSubmitting(false);

    if (error) {
      setSuccess(false);
      setFeedback(error);
    } else {
      setSuccess(true);
      setFeedback('Merci de votre inscription !');
    }
  };

  return (
    <form id={formId} className={styles.nl__form} onSubmit={handleSubmit}>
      <div className={styles.nl__inputs}>
        <input
          className="fr-input"
          type="email"
          id={`${formId}-email`}
          name="email"
          aria-label="Adresse email"
          placeholder="Votre adresse email"
          required
        />
        <Button
          type="submit"
          disabled={submitting || (captchaEnabled && !captchaSolution)}
        >
          S&apos;inscrire
        </Button>
      </div>
      {captchaEnabled && (
        <div className={styles.nl__captcha}>
          <Captcha onSolved={setCaptchaSolution} />
        </div>
      )}
      {feedback && (
        <div className={styles.nl__feedback}>
          <Alert
            description={feedback}
            severity={success ? 'success' : 'error'}
            closable={false}
            small={true}
          />
        </div>
      )}
    </form>
  );
}
