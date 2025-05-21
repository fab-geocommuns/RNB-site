'use client';

// Action
import { changePassword } from '@/actions/auth';
import { useState } from 'react';
import { Alert } from '@codegouvfr/react-dsfr/Alert';

export default function ChangePasswordForm({
  b64UserId,
  token,
}: {
  b64UserId: string;
  token: string;
}) {
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccess(false);
    setErrors([]);

    const form = e.currentTarget;
    const data = new FormData(form);

    const newPwd = data.get('password') as string;
    const newPwdConfirmation = data.get('password_confirmation') as string;

    // Call the action
    const result = await changePassword(
      b64UserId,
      token,
      newPwd,
      newPwdConfirmation,
    );

    if (result.response_code === 204) {
      // Success
      setSuccess(true);
      setErrors([]);
    } else if (result.response_code === 400) {
      // Handle validation errors
      setSuccess(false);
      if (result?.error) {
        setErrors(result.error);
      }
    } else {
      // handle other errors
      setSuccess(false);
      setErrors([
        "Une erreur est survenue. L'équipe du RNB est prévenue. Veuillez réessayer plus tard.",
      ]);
    }
  };

  return (
    <>
      {errors.length > 0 && (
        <div className="fr-mb-3w">
          <Alert
            title="Erreur"
            description={
              <ul>
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            }
            severity="error"
          />
        </div>
      )}
      {success && (
        <div className="fr-mb-3w">
          <Alert
            title="Mot de passe changé"
            description="Votre mot de passe a été changé avec succès. Vous pouvez l'utiliser pour vous connecter."
            severity="success"
          />
        </div>
      )}
      <form onSubmit={(e) => handleSubmit(e)}>
        <input type="hidden" name="b64UserId" value={b64UserId} />
        <input type="hidden" name="token" value={token} />

        <div className="fr-input-group fr-mb-4v fr-mt-10v">
          <label className="fr-label" htmlFor="password">
            Nouveau mot de passe
          </label>
          <input
            className="fr-input"
            type="password"
            name="password"
            id="password"
            required
          />
        </div>
        <div className="fr-input-group fr-mb-6v">
          <label className="fr-label" htmlFor="passwordConfirmation">
            Confirmation du mot de passe
          </label>
          <input
            className="fr-input"
            type="password"
            name="password_confirmation"
            id="passwordConfirmation"
            required
          />
        </div>
        <button className="fr-btn" type="submit">
          Enregistrer mon nouveau mot de passe
        </button>
      </form>
    </>
  );
}
