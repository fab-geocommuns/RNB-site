'use client';

import { signIn } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import Input from '@codegouvfr/react-dsfr/Input';

import { UNEXPECTED_ERROR_MESSAGE } from '@/utils/actionResult';
import {
  MFA_INVALID_MESSAGE,
  MfaError,
  mfaErrorOf,
  THROTTLED_MESSAGE,
} from '@/utils/mfa';
import { rnbApi, RnbApiError } from '@/utils/rnbApi';

type MfaSetup = {
  otpauth_uri: string;
  secret: string;
  qr_code_svg: string;
};

type MfaConfirmation = {
  token: string;
  backup_codes: string[];
};

type MfaEnrollmentProps = {
  username: string;
  password: string;
  // Only offered when the API suggests enrollment: the user already has a session
  canPostpone?: boolean;
  redirectUrl: string;
  // Called once the backup codes are shown: the password is no longer needed
  onEnrolled: () => void;
  onLogInAgain: () => void;
};

// Credentials refused by the API, e.g. password changed since the login
const isCredentialsError = (error: unknown) =>
  error instanceof RnbApiError &&
  error.status === 400 &&
  !!error.data &&
  typeof error.data === 'object' &&
  'non_field_errors' in error.data;

// Errors the enrollment cannot recover from: the user has to log in again
const mustLogInAgainAfter = (error: unknown) =>
  mfaErrorOf(error) === MfaError.AlreadyConfigured || isCredentialsError(error);

const errorMessage = (error: unknown) => {
  const mfaError = mfaErrorOf(error);
  if (mfaError === MfaError.Throttled) return THROTTLED_MESSAGE;
  if (mfaError === MfaError.AlreadyConfigured) {
    return "Une application d'authentification est déjà configurée. Connectez-vous avec votre code.";
  }
  if (isCredentialsError(error)) {
    return 'Email ou mot de passe incorrect. Reconnectez-vous.';
  }
  return error instanceof RnbApiError
    ? error.message
    : UNEXPECTED_ERROR_MESSAGE;
};

// Each screen heading has its own `key`, so it is a new element that takes the focus
const focusOnMount = (heading: HTMLHeadingElement | null) => heading?.focus();

export default function MfaEnrollment({
  username,
  password,
  canPostpone = false,
  redirectUrl,
  onEnrolled,
  onLogInAgain,
}: MfaEnrollmentProps) {
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [setupFailed, setSetupFailed] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [signInFailed, setSignInFailed] = useState(false);
  const [mustLogInAgain, setMustLogInAgain] = useState(false);

  const startSetup = useCallback(async () => {
    setSetup(null);
    setSetupFailed(false);
    setOtp('');
    try {
      setSetup(
        await rnbApi.post<MfaSetup>('/auth/mfa/setup/', { username, password }),
      );
    } catch (error) {
      setSetupFailed(true);
      setApiError(errorMessage(error));
      setMustLogInAgain(mustLogInAgainAfter(error));
    }
  }, [username, password]);

  // Each setup call replaces the pending key, and strict mode runs effects twice
  const setupRequested = useRef(false);
  useEffect(() => {
    if (setupRequested.current) return;
    setupRequested.current = true;
    startSetup();
  }, [startSetup]);

  const retrySetup = () => {
    setApiError(null);
    startSetup();
  };

  const goToRedirectUrl = () => {
    window.location.href = redirectUrl;
  };

  const confirmEnrollment = async () => {
    let confirmation: MfaConfirmation;
    try {
      confirmation = await rnbApi.post<MfaConfirmation>('/auth/mfa/confirm/', {
        username,
        password,
        otp,
      });
    } catch (error) {
      const mfaError = mfaErrorOf(error);
      if (mfaError === MfaError.Invalid) {
        setOtpError(true);
        setOtp('');
        return;
      }
      setApiError(errorMessage(error));
      if (mustLogInAgainAfter(error)) {
        setSetup(null);
        setMustLogInAgain(true);
      } else if (mfaError === MfaError.SetupNotStarted) {
        startSetup();
      }
      return;
    }

    // The API returns the backup codes only once: shown whatever happens to the sign-in
    setBackupCodes(confirmation.backup_codes);
    onEnrolled();

    // The first code is consumed by the confirmation: the session is opened with the returned token
    if (!canPostpone) {
      try {
        const signInResult = await signIn('api-token', {
          token: confirmation.token,
          redirect: false,
        });
        setSignInFailed(!signInResult?.ok);
      } catch {
        setSignInFailed(true);
      }
    }
  };

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setApiError(null);
    setOtpError(false);
    try {
      await confirmEnrollment();
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorAlert = (message: string | null) =>
    message && (
      <div className="fr-mb-3w">
        <Alert description={message} severity="error" small closable={false} />
      </div>
    );

  if (backupCodes) {
    return (
      <>
        <h3 key="backup-codes-heading" ref={focusOnMount} tabIndex={-1}>
          Codes de secours
        </h3>
        {errorAlert(
          signInFailed
            ? 'Votre application est configurée, mais la connexion a échoué. Reconnectez-vous avec un code.'
            : null,
        )}
        <Alert
          className="fr-mb-3w"
          description="Conservez ces codes de secours en lieu sûr. Chacun permet une seule connexion si vous n'avez plus accès à votre application. Ils ne seront plus affichés."
          severity="warning"
          small
          closable={false}
        />
        <ul data-testid="backup-codes">
          {backupCodes.map((code) => (
            <li key={code}>
              <code>{code}</code>
            </li>
          ))}
        </ul>
        {signInFailed ? (
          <Button onClick={onLogInAgain}>Se reconnecter</Button>
        ) : (
          <Button onClick={goToRedirectUrl} disabled={isSubmitting}>
            Continuer
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      <h3 key="setup-heading" ref={focusOnMount} tabIndex={-1}>
        Configurer la double authentification
      </h3>
      {errorAlert(apiError)}
      <p>
        Pour sécuriser votre compte, installez une application
        d&apos;authentification sur votre téléphone, puis scannez ce QR code.
      </p>
      {setup && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG from the API, nothing to optimize */}
          <img
            src={`data:image/svg+xml,${encodeURIComponent(setup.qr_code_svg)}`}
            alt="QR code à scanner avec votre application d'authentification"
            width={200}
            height={200}
          />
          <p className="fr-mt-2w">
            Vous ne pouvez pas scanner le QR code ? Saisissez cette clé dans
            votre application : <code>{setup.secret}</code>
          </p>
        </>
      )}
      <form onSubmit={handleConfirm}>
        {setup && (
          <Input
            label="Code à 6 chiffres"
            hintText="Affiché par votre application"
            state={otpError ? 'error' : 'default'}
            stateRelatedMessage={otpError ? MFA_INVALID_MESSAGE : undefined}
            nativeInputProps={{
              name: 'otp',
              required: true,
              autoComplete: 'one-time-code',
              inputMode: 'numeric',
              value: otp,
              onChange: (e) => setOtp(e.target.value),
            }}
          />
        )}
        <ButtonsGroup
          inlineLayoutWhen="sm and up"
          buttons={[
            mustLogInAgain
              ? {
                  children: 'Se reconnecter',
                  type: 'button',
                  onClick: onLogInAgain,
                }
              : setupFailed
                ? {
                    children: 'Réessayer',
                    type: 'button',
                    onClick: retrySetup,
                  }
                : {
                    children: 'Activer',
                    type: 'submit',
                    disabled: !setup || isSubmitting,
                  },
            ...(canPostpone
              ? [
                  {
                    children: 'Plus tard',
                    priority: 'secondary' as const,
                    type: 'button' as const,
                    onClick: goToRedirectUrl,
                  },
                ]
              : []),
          ]}
        />
      </form>
    </>
  );
}
