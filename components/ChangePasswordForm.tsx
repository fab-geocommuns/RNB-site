'use client';

// Action
import { changePassword } from '@/actions/auth';
import { useState } from 'react';

export default function ChangePasswordForm({
  b64UserId,
  token,
}: {
  b64UserId: string;
  token: string;
}) {
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);

    // Call the action
    const res = await changePassword(b64UserId, token, data);

    if (res.status === 204) {
      // Success
    } else if (res.status === 400) {
      // Handle validation errors
    } else {
      // handle other errors
    }
  };

  return (
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
  );
}
