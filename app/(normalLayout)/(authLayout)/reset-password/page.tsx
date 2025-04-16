'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import styles from '@/styles/login.module.scss';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get('email');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement)
      .value;

    const resetPasswordResult = await fetch(
      process.env.NEXT_PUBLIC_API_BASE + '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({
          email: username,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!resetPasswordResult.ok) {
      setSuccess(false);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div
      className={`fr-container ${styles.loginShell} fr-px-md-12v fr-py-10v fr-py-md-14v `}
    >
      <h2>Mot de passe oublié</h2>
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        action="api/auth/callback/credentials"
        method="post"
      >
        <div className="fr-input-group">
          <label className="fr-label" htmlFor="username">
            E-mail
          </label>

          <input
            className="fr-input"
            type="text"
            name="username"
            id="username"
            defaultValue={prefilledEmail || ''}
          />
        </div>
        <div className="fr-flex fr-flex--gap-1w">
          <button className="fr-btn" type="submit">
            Réinitialiser le mot de passe
          </button>

          <Link href="/login" className="fr-link">
            Retour à la page de connexion
          </Link>
        </div>
      </form>
    </div>
  );
}
