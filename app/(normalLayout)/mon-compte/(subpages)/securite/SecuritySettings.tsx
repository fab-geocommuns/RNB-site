'use client';

import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import Input from '@codegouvfr/react-dsfr/Input';
import { PasswordInput } from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import BackupCodes from '@/components/authentication/BackupCodes';
import MfaEnrollment from '@/components/authentication/MfaEnrollment';
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

const PAGE_PATH = '/mon-compte/securite';

enum SecurityAction {
  EnableApp,
  ReplaceApp,
  RegenerateCodes,
}

const ACTION_TITLES: Record<SecurityAction, string> = {
  [SecurityAction.EnableApp]: 'Activer la double authentification',
  [SecurityAction.ReplaceApp]: "Changer d'application",
  [SecurityAction.RegenerateCodes]: 'Régénérer les codes de secours',
};

export default function SecuritySettings({
  username,
  mfaConfigured,
}: {
  username: string;
  mfaConfigured: boolean;
}) {
  const router = useRouter();
  const [action, setAction] = useState<SecurityAction | null>(null);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  // Back to the proof form of the current action, or to the overview without one
  const showProofForm = (nextAction: SecurityAction | null) => {
    setAction(nextAction);
    setPassword('');
    setOtp('');
    setPasswordError(false);
    setOtpError(false);
    setApiError(null);
    setSetup(null);
    setBackupCodes(null);
  };
  const backToOverview = () => showProofForm(null);

  const showProofError = (error: unknown) => {
    const mfaError = mfaErrorOf(error);
    if (mfaError === MfaError.Invalid) {
      setOtpError(true);
      setOtp('');
    } else if (mfaError === MfaError.Throttled) {
      setApiError(THROTTLED_MESSAGE);
    } else if (
      mfaError === MfaError.AlreadyConfigured ||
      mfaError === MfaError.SetupNotStarted
    ) {
      // The app was set up or removed in another session: show the current state
      backToOverview();
      router.refresh();
    } else if (isCredentialsError(error)) {
      setPasswordError(true);
    } else {
      setApiError(
        error instanceof RnbApiError ? error.message : UNEXPECTED_ERROR_MESSAGE,
      );
    }
  };

  // Public client: an expired session token would make these views answer 401
  const proveCurrentFactor = async (proven: SecurityAction) => {
    if (proven === SecurityAction.EnableApp) {
      setSetup(
        await rnbApi.post<MfaSetup>('/auth/mfa/setup/', { username, password }),
      );
    } else if (proven === SecurityAction.ReplaceApp) {
      setSetup(
        await rnbApi.post<MfaSetup>('/auth/mfa/replace/setup/', {
          username,
          password,
          otp,
        }),
      );
    } else {
      const { backup_codes } = await rnbApi.post<{ backup_codes: string[] }>(
        '/auth/mfa/backup_codes/',
        { username, password, otp },
      );
      setBackupCodes(backup_codes);
      setPassword('');
    }
  };

  const handleProof = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (action === null || isSubmitting) return;

    setIsSubmitting(true);
    setPasswordError(false);
    setOtpError(false);
    setApiError(null);
    try {
      await proveCurrentFactor(action);
    } catch (error) {
      showProofError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (action === null) {
    if (!mfaConfigured) {
      return (
        <>
          <p>
            La double authentification n&apos;est pas activée. Une fois activée,
            vous saisirez à chaque connexion, en plus de votre mot de passe, un
            code affiché par une application sur votre téléphone.
          </p>
          <Button onClick={() => showProofForm(SecurityAction.EnableApp)}>
            Activer la double authentification
          </Button>
        </>
      );
    }

    return (
      <>
        <h2>Application d&apos;authentification</h2>
        <p>
          Votre application affiche le code demandé à chaque connexion. Vous
          changez de téléphone ? Configurez une nouvelle application.
        </p>
        <Button
          priority="secondary"
          onClick={() => showProofForm(SecurityAction.ReplaceApp)}
        >
          Changer d&apos;application
        </Button>
        <h2 className="fr-mt-6w">Codes de secours</h2>
        <p>
          Chaque code de secours permet une seule connexion sans votre
          application. De nouveaux codes rendent les anciens inutilisables.
        </p>
        <Button
          priority="secondary"
          onClick={() => showProofForm(SecurityAction.RegenerateCodes)}
        >
          Régénérer les codes
        </Button>
      </>
    );
  }

  // The proof form has its own key: back from a later step ("Recommencer"),
  // its heading is a new element that takes the focus again
  const heading = (key: string) => (
    <h2 key={key} ref={focusOnMount} tabIndex={-1}>
      {ACTION_TITLES[action]}
    </h2>
  );

  if (setup && action === SecurityAction.ReplaceApp) {
    return (
      <>
        {heading('action-heading')}
        <MfaEnrollment
          username={username}
          password={password}
          onEnrolled={() => setPassword('')}
          replacement={{
            onClose: backToOverview,
            onRestart: () => showProofForm(SecurityAction.ReplaceApp),
          }}
          initialSetup={setup}
        />
      </>
    );
  }

  if (setup) {
    return (
      <>
        {heading('action-heading')}
        <MfaEnrollment
          username={username}
          password={password}
          onEnrolled={() => setPassword('')}
          initialSetup={setup}
          redirectUrl={PAGE_PATH}
          onLogInAgain={() =>
            signOut({ callbackUrl: `/connexion?redirect=${PAGE_PATH}` })
          }
        />
      </>
    );
  }

  if (backupCodes) {
    return (
      <>
        {heading('action-heading')}
        <h3 key="backup-codes-heading" ref={focusOnMount} tabIndex={-1}>
          Codes de secours
        </h3>
        <BackupCodes codes={backupCodes} />
        <Button onClick={backToOverview}>Terminer</Button>
      </>
    );
  }

  return (
    <>
      {heading('proof-heading')}
      {apiError && (
        <div className="fr-mb-3w">
          <Alert
            description={apiError}
            severity="error"
            small
            closable={false}
          />
        </div>
      )}
      <form onSubmit={handleProof}>
        {/* Locked while pending: the next step reuses the password checked here */}
        <PasswordInput
          label="Mot de passe"
          disabled={isSubmitting}
          messagesHint=""
          messages={
            passwordError
              ? [{ severity: 'error', message: 'Mot de passe incorrect.' }]
              : []
          }
          nativeInputProps={{
            name: 'password',
            required: true,
            autoComplete: 'current-password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
          }}
        />
        {action !== SecurityAction.EnableApp && (
          <Input
            label="Code à 6 chiffres"
            hintText={
              // The backup code is spent at "Vérifier", before the new app is confirmed
              action === SecurityAction.ReplaceApp
                ? "Ou l'un de vos codes de secours. Un code de secours saisi ici ne servira plus, même si vous annulez ensuite."
                : "Ou l'un de vos codes de secours"
            }
            disabled={isSubmitting}
            state={otpError ? 'error' : 'default'}
            stateRelatedMessage={otpError ? MFA_INVALID_MESSAGE : undefined}
            nativeInputProps={{
              name: 'otp',
              required: true,
              autoComplete: 'one-time-code',
              value: otp,
              onChange: (e) => setOtp(e.target.value),
            }}
          />
        )}
        <ButtonsGroup
          inlineLayoutWhen="sm and up"
          buttons={[
            {
              children: 'Vérifier',
              type: 'submit',
              disabled: isSubmitting,
            },
            {
              children: 'Annuler',
              priority: 'secondary',
              type: 'button',
              disabled: isSubmitting,
              onClick: backToOverview,
            },
          ]}
        />
      </form>
    </>
  );
}
