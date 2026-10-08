'use client';

import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { TagProps } from '@codegouvfr/react-dsfr/Tag';
import TagsGroup from '@codegouvfr/react-dsfr/TagsGroup';
import { ComponentProps, useRef, useState } from 'react';
import Captcha from '@/components/authentication/Captcha';
import {
  AdsAccessRequestErrors,
  MAX_INSEE_CODES,
  validateAdsAccessRequest,
  validateInseeCode,
} from './accessRequest';
import { requestAdsAccess } from './requestAdsAccess';

const captchaEnabled = process.env.NEXT_PUBLIC_ENABLE_CAPTCHA === 'true';

type TagsTuple = ComponentProps<typeof TagsGroup>['tags'];

const fieldState = (message?: string) => (message ? 'error' : 'default');

export default function AdsAccessRequestForm() {
  const [fieldErrors, setFieldErrors] = useState<AdsAccessRequestErrors>({});
  const [inseeCodes, setInseeCodes] = useState<string[]>([]);
  const [pendingCode, setPendingCode] = useState('');
  const codeInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaSolution, setCaptchaSolution] = useState<string | null>(null);
  // The captcha is mounted when the user engages with the form. A solution is
  // single-use: the key remounts it after each call to the server.
  const [captchaMounted, setCaptchaMounted] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);

  const clearFieldError = (field: keyof AdsAccessRequestErrors) =>
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }));

  const clearCodesError = () => clearFieldError('inseeCodes');

  const addPendingCode = () => {
    const code = pendingCode.trim().toUpperCase();
    if (!code) {
      return;
    }
    const message =
      validateInseeCode(code) ??
      (inseeCodes.includes(code) ? 'Ce code est déjà ajouté.' : undefined) ??
      (inseeCodes.length >= MAX_INSEE_CODES
        ? `Vous ne pouvez pas ajouter plus de ${MAX_INSEE_CODES} codes.`
        : undefined);
    if (message) {
      setFieldErrors((errors) => ({ ...errors, inseeCodes: message }));
      return;
    }
    setInseeCodes((codes) => [...codes, code]);
    setPendingCode('');
    clearCodesError();
  };

  const removeCode = (code: string) => {
    setInseeCodes((codes) => codes.filter((c) => c !== code));
    clearCodesError();
    codeInputRef.current?.focus();
  };

  const tags = inseeCodes.map(
    (code): TagProps => ({
      children: code,
      as: 'button',
      dismissible: true,
      onClick: () => removeCode(code),
      nativeButtonProps: { type: 'button', 'aria-label': `Retirer ${code}` },
    }),
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const values = {
      email: formData.get('email') as string,
      inseeCodes,
      organisation: formData.get('organisation') as string,
    };

    setError(null);

    if (pendingCode.trim()) {
      setFieldErrors({
        inseeCodes: "Ajoutez ce code avec le bouton Ajouter avant d'envoyer.",
      });
      return;
    }

    const validation = validateAdsAccessRequest(values);
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const errors = await requestAdsAccess({ ...values, captchaSolution });
      if (!errors) {
        setSuccess(true);
        return;
      }
      const { captcha, ...fields } = errors;
      setFieldErrors(fields);
      setError(captcha ?? null);
    } catch {
      setError('Une erreur est survenue. Merci de réessayer plus tard.');
    } finally {
      setSubmitting(false);
      setCaptchaSolution(null);
      setCaptchaKey((key) => key + 1);
    }
  };

  if (success) {
    return (
      <div className={fr.cx('fr-py-12w')}>
        <Alert
          title="Demande envoyée"
          description="Votre demande a bien été envoyée. Elle sera étudiée par l'équipe du RNB."
          severity="success"
          closable={false}
        />
        <Button
          className={fr.cx('fr-mt-3w')}
          priority="secondary"
          linkProps={{ href: '/outils-services' }}
        >
          Retour aux outils et services
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      onFocus={() => setCaptchaMounted(true)}
      onInput={() => setCaptchaMounted(true)}
    >
      {error && (
        <div className={fr.cx('fr-mb-3w')}>
          <Alert
            description={error}
            severity="error"
            closable={false}
            small={true}
          />
        </div>
      )}
      <Input
        label="Adresse email"
        hintText="La clé d'accès (token) sera envoyée à cette adresse si votre demande est acceptée"
        nativeInputProps={{
          name: 'email',
          type: 'email',
          onChange: () => clearFieldError('email'),
        }}
        state={fieldState(fieldErrors.email)}
        stateRelatedMessage={fieldErrors.email}
      />
      <Input
        label="Codes INSEE des communes concernées"
        hintText="Saisissez un code à la fois, puis cliquez sur Ajouter ou appuyez sur Entrée. Exemple : 75056"
        nativeInputProps={{
          ref: codeInputRef,
          value: pendingCode,
          onChange: (e) => {
            setPendingCode(e.target.value);
            clearCodesError();
          },
          onKeyDown: (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addPendingCode();
            }
          },
        }}
        addon={
          <Button type="button" priority="secondary" onClick={addPendingCode}>
            Ajouter
          </Button>
        }
        state={fieldState(fieldErrors.inseeCodes)}
        stateRelatedMessage={fieldErrors.inseeCodes}
      />
      {tags.length > 0 && (
        <TagsGroup className={fr.cx('fr-mb-3w')} tags={tags as TagsTuple} />
      )}
      <Input
        label="Organisation"
        hintText="Exemple : Mairie de Nantes"
        nativeInputProps={{
          name: 'organisation',
          onChange: () => clearFieldError('organisation'),
        }}
        state={fieldState(fieldErrors.organisation)}
        stateRelatedMessage={fieldErrors.organisation}
      />
      {captchaEnabled && captchaMounted && (
        <div className={fr.cx('fr-mb-3w')}>
          <Captcha key={captchaKey} onSolved={setCaptchaSolution} />
        </div>
      )}
      <Button
        type="submit"
        disabled={submitting || (captchaEnabled && !captchaSolution)}
      >
        Envoyer la demande
      </Button>
    </form>
  );
}
