'use client';

import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { useState } from 'react';
import Captcha from '@/components/authentication/Captcha';
import InlineInputButton from '@/components/InlineInputButton';
import { subscribeToNewsletter } from './subscribe';

type Props = {
  formId?: string;
};

const captchaEnabled = process.env.NEXT_PUBLIC_ENABLE_CAPTCHA === 'true';

export default function NewsletterForm({ formId = 'newsletter-form' }: Props) {
  const [captchaSolution, setCaptchaSolution] = useState<string | null>(null);
  // The captcha is mounted when the user engages with the field, not on page
  // load (the form lives in the header modal of every page). A solution is
  // single-use, so it is unmounted after each submit and mounted again on the
  // next engagement.
  const [captchaMounted, setCaptchaMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    success: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = new FormData(e.currentTarget).get('email') as string;

    setSubmitting(true);
    setFeedback(null);

    const error = await subscribeToNewsletter({ email, captchaSolution }).catch(
      () => 'Une erreur est survenue. Merci de réessayer plus tard.',
    );

    setSubmitting(false);
    setCaptchaSolution(null);
    setCaptchaMounted(false);

    setFeedback(
      error
        ? { message: error, success: false }
        : { message: 'Merci de votre inscription !', success: true },
    );
  };

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <InlineInputButton
        label="Adresse email"
        buttonLabel="S'inscrire"
        disabled={submitting || (captchaEnabled && !captchaSolution)}
        nativeInputProps={{
          type: 'email',
          id: `${formId}-email`,
          name: 'email',
          placeholder: 'Votre adresse email',
          required: true,
          onFocus: () => setCaptchaMounted(true),
          onInput: () => setCaptchaMounted(true),
        }}
      />
      {captchaEnabled && captchaMounted && (
        <div className={fr.cx('fr-mt-1w')}>
          <Captcha onSolved={setCaptchaSolution} />
        </div>
      )}
      {feedback && (
        <div className={fr.cx('fr-mt-1w')}>
          <Alert
            description={feedback.message}
            severity={feedback.success ? 'success' : 'error'}
            closable={false}
            small={true}
          />
        </div>
      )}
    </form>
  );
}
