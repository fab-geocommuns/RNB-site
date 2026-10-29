'use client';

import { getSession, signIn } from 'next-auth/react';
import { useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import Input from '@codegouvfr/react-dsfr/Input';

import MfaEnrollment from '@/components/authentication/MfaEnrollment';
import { isSafeRedirectUrl } from '@/utils/isSafeRedirectUrl';
import { MFA_INVALID_MESSAGE, MfaError, THROTTLED_MESSAGE } from '@/utils/mfa';

const LOGIN_FAILED_MESSAGE = 'La connexion a échoué. Réessayez.';

enum LoginStep {
  Credentials,
  Otp,
  Enrollment,
}

export default function LoginForm() {
  const [step, setStep] = useState(LoginStep.Credentials);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canPostponeEnrollment, setCanPostponeEnrollment] = useState(false);
  // Back from the code or enrollment step, the focus goes to the email field
  const [focusEmail, setFocusEmail] = useState(false);

  // Get the redirect query parameter
  const params = useSearchParams();

  let redirectUrl = '/edition';
  const redirect = params.get('redirect');
  if (redirect && isSafeRedirectUrl(redirect)) {
    redirectUrl = redirect;
  }

  const [successMessage, setSuccessMessage] = useState<string | null>(
    params.get('success'),
  );

  const prefilledEmail = params.get('email') || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const showLoginError = (error: string) => {
    switch (error) {
      case MfaError.Required:
        setStep(LoginStep.Otp);
        break;
      case MfaError.Invalid:
        setOtpError(true);
        setOtp('');
        break;
      case MfaError.SetupRequired:
        setCanPostponeEnrollment(false);
        setStep(LoginStep.Enrollment);
        break;
      case MfaError.Throttled:
        setLoginError(THROTTLED_MESSAGE);
        break;
      default:
        // At the code step, the password was already accepted
        setLoginError(
          step === LoginStep.Otp
            ? LOGIN_FAILED_MESSAGE
            : 'Email ou mot de passe incorrect',
        );
    }
  };

  const backToCredentials = () => {
    setOtp('');
    setOtpError(false);
    setLoginError(null);
    setFocusEmail(true);
    setStep(LoginStep.Credentials);
  };

  const logIn = async () => {
    const loginResult = await signIn('credentials', {
      username: email,
      password: password,
      // An undefined value would be sent as the string "undefined"
      ...(step === LoginStep.Otp ? { otp } : {}),
      callbackUrl: redirectUrl,
      redirect: false,
    });

    if (loginResult?.error) {
      showLoginError(loginResult.error);
      return;
    }

    const session = await getSession();
    if (session?.mfaSetupSuggested) {
      setCanPostponeEnrollment(true);
      setStep(LoginStep.Enrollment);
      return;
    }

    setPassword('');
    setSuccessMessage('Connexion réussie');
    // FIXME: Investigate further why router.push does not preserve duplicate query parameters?
    // Is it a known behavior or a bug on our end?
    window.location.href = redirectUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    setLoginError(null);
    setOtpError(false);
    try {
      await logIn();
    } catch {
      setLoginError(LOGIN_FAILED_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === LoginStep.Enrollment) {
    return (
      <MfaEnrollment
        username={email}
        password={password}
        canPostpone={canPostponeEnrollment}
        redirectUrl={redirectUrl}
        onEnrolled={() => setPassword('')}
        onLogInAgain={backToCredentials}
      />
    );
  }

  return (
    <>
      {loginError && (
        <>
          <div className="fr-mb-3w">
            <Alert
              description={loginError}
              severity="error"
              small
              closable={false}
            />
          </div>
        </>
      )}
      {successMessage && (
        <>
          <div className="fr-mb-3w">
            <Alert
              description={successMessage}
              severity="success"
              small
              closable={false}
            />
          </div>
        </>
      )}
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        action="api/auth/callback/credentials"
        method="post"
        data-testid="login-form"
      >
        {step === LoginStep.Otp ? (
          <Input
            label="Code à 6 chiffres"
            hintText="Ou l'un de vos codes de secours"
            id="otp"
            state={otpError ? 'error' : 'default'}
            stateRelatedMessage={otpError ? MFA_INVALID_MESSAGE : undefined}
            nativeInputProps={{
              name: 'otp',
              required: true,
              autoComplete: 'one-time-code',
              autoFocus: true,
              value: otp,
              onChange: (e) => {
                setOtp(e.target.value);
              },
            }}
          />
        ) : (
          <>
            <Input
              label="Email"
              id="email"
              nativeInputProps={{
                name: 'email',
                type: 'email',
                required: true,
                autoFocus: focusEmail,
                value: email,
                onChange: (e) => {
                  setEmail(e.target.value);
                },
              }}
            />

            <Input
              label="Mot de passe"
              id="password"
              nativeInputProps={{
                name: 'password',
                type: 'password',
                required: true,
                value: password,
                onChange: (e) => {
                  setPassword(e.target.value);
                },
                autoFocus: prefilledEmail !== '' && !focusEmail,
              }}
            />

            <div className="fr-mb-3w">
              <a
                className="fr-link fr-link--bold"
                href={`/auth/mdp-oublie?email=${encodeURIComponent(email)}`}
                title="Mot de passe oublié ?"
              >
                Mot de passe oublié ?
              </a>
            </div>
          </>
        )}

        {step === LoginStep.Otp ? (
          <ButtonsGroup
            inlineLayoutWhen="sm and up"
            buttons={[
              {
                children: 'Se connecter',
                type: 'submit',
                disabled: isSubmitting,
              },
              {
                children: 'Retour',
                priority: 'tertiary',
                iconId: 'fr-icon-arrow-left-line',
                type: 'button',
                disabled: isSubmitting,
                onClick: backToCredentials,
              },
            ]}
          />
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            Se connecter
          </Button>
        )}
      </form>
      {step === LoginStep.Credentials && (
        <p className="fr-mt-3w">
          Vous n&apos;avez pas de compte RNB ?{' '}
          <a href="/inscription" className="fr-link">
            Inscrivez-vous
          </a>
        </p>
      )}
    </>
  );
}
