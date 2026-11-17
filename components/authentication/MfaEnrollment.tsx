'use client';

import { signIn } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import { Highlight } from '@codegouvfr/react-dsfr/Highlight';
import Input from '@codegouvfr/react-dsfr/Input';

import BackupCodes from '@/components/authentication/BackupCodes';
import { UNEXPECTED_ERROR_MESSAGE } from '@/utils/actionResult';
import {
  focusOnMount,
  isCredentialsError,
  MFA_INVALID_MESSAGE,
  MfaError,
  mfaErrorOf,
  MfaSetup,
  THROTTLED_MESSAGE,
} from '@/utils/mfa';
import { rnbApi, RnbApiError } from '@/utils/rnbApi';

type MfaConfirmation = {
  login_code: string;
  backup_codes: string[];
};

type MfaEnrollmentProps = {
  username: string;
  password: string;
  // Only given when the API suggests enrollment: the user already has a session.
  // Called when the user declines, before going to the redirect URL.
  onPostpone?: () => void;
  redirectUrl: string;
  // Called once the backup codes are shown: the password is no longer needed
  onEnrolled: () => void;
  onLogInAgain: () => void;
};

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

export default function MfaEnrollment({
  username,
  password,
  onPostpone,
  redirectUrl,
  onEnrolled,
  onLogInAgain,
}: MfaEnrollmentProps) {
  const canPostpone = onPostpone !== undefined;
  // A suggested enrollment first asks whether to set it up, without a QR code
  const [wantsSetup, setWantsSetup] = useState(!canPostpone);
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [setupFailed, setSetupFailed] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollment, setEnrollment] = useState<MfaConfirmation | null>(null);
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
    if (!wantsSetup || setupRequested.current) return;
    setupRequested.current = true;
    startSetup();
  }, [wantsSetup, startSetup]);

  const retrySetup = () => {
    setApiError(null);
    startSetup();
  };

  const goToRedirectUrl = () => {
    window.location.href = redirectUrl;
  };

  const postpone = () => {
    onPostpone?.();
    goToRedirectUrl();
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

    setEnrollment(confirmation);
    onEnrolled();
  };

  // The API returns the backup codes only once, and `signIn` leaves the page when
  // next-auth is down: the session opens on "Continuer", once they are on screen.
  const continueToRedirectUrl = async (loginCode: string) => {
    setIsSubmitting(true);
    try {
      // The confirmation renews the API token, even for a session opened at login:
      // the session is opened again with the returned one-time code
      const signInResult = await signIn('mfa-enrollment', {
        code: loginCode,
        redirect: false,
      });
      if (signInResult?.ok) {
        goToRedirectUrl();
        return;
      }
    } catch {
      // Same screen as a refused sign-in, below
    }
    setSignInFailed(true);
    setIsSubmitting(false);
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

  if (enrollment) {
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
        <BackupCodes codes={enrollment.backup_codes} apiTokenRenewed />
        {signInFailed ? (
          <Button onClick={onLogInAgain}>Se reconnecter</Button>
        ) : (
          <Button
            onClick={() => continueToRedirectUrl(enrollment.login_code)}
            disabled={isSubmitting}
          >
            Continuer
          </Button>
        )}
      </>
    );
  }

  if (!wantsSetup) {
    return (
      <>
        <h3 key="suggestion-heading" ref={focusOnMount} tabIndex={-1}>
          Vous êtes connecté
        </h3>
        <p>
          Si vous le souhaitez, vous pouvez protéger votre compte avec la double
          authentification.
        </p>
        <Highlight className="fr-ml-0 fr-mb-4w">
          À chaque connexion, en plus de votre mot de passe, vous saisirez un
          code affiché par une application sur votre téléphone.
        </Highlight>
        <ButtonsGroup
          inlineLayoutWhen="sm and up"
          buttons={[
            {
              children: 'Activer maintenant',
              type: 'button',
              onClick: () => setWantsSetup(true),
            },
            {
              children: 'Continuer sans activer',
              priority: 'secondary',
              type: 'button',
              onClick: postpone,
            },
          ]}
        />
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
                    children: 'Continuer sans activer',
                    priority: 'secondary' as const,
                    type: 'button' as const,
                    // Leaving during the confirmation would lose the backup codes
                    disabled: isSubmitting,
                    onClick: postpone,
                  },
                ]
              : []),
          ]}
        />
      </form>
    </>
  );
}
