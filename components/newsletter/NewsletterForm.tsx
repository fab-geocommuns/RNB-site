'use client';

import styles from '@/styles/newsletter.module.scss';
import { useState, type FormEvent } from 'react';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';

import {
  BREVO_NEWSLETTER_URL,
  GENERIC_ERROR,
  subscribeToNewsletter,
} from './brevo';

type Props = {
  formId?: string;
};

type Status = {
  severity: 'error' | 'success';
  message: string;
};

export default function NewsletterForm({ formId = 'newsletter-form' }: Props) {
  const [status, setStatus] = useState<Status | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    setStatus(null);

    setSubmitting(true);

    try {
      const error = await subscribeToNewsletter(formData);
      if (error) {
        setStatus({ severity: 'error', message: error });
        return;
      }

      setStatus({
        severity: 'success',
        message: 'Merci de votre inscription !',
      });
      formEl.reset();
    } catch {
      setStatus({ severity: 'error', message: GENERIC_ERROR });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      method="POST"
      action={BREVO_NEWSLETTER_URL}
    >
      <div className={styles.nl__inputs}>
        <input
          className="fr-input"
          type="email"
          name="EMAIL"
          aria-label="Adresse email"
          placeholder="Votre adresse email"
          required
        />

        <Button type="submit" disabled={submitting}>
          S&apos;inscrire
        </Button>

        {/* Champ leurre : visible pour le DOM, hors écran pour l'humain. Un
            bot qui remplit tous les champs le remplira, et Brevo rejette la
            soumission. Ne pas passer en type="hidden", les bots les ignorent. */}
        <input
          type="text"
          name="email_address_check"
          defaultValue=""
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
          }}
        />
        <input type="hidden" name="locale" value="fr" />
      </div>

      {status && (
        <div className={styles.nl__feedback}>
          <Alert
            description={status.message}
            severity={status.severity}
            small
            closable={false}
          />
        </div>
      )}
    </form>
  );
}
