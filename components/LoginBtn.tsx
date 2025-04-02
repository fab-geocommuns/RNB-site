'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function LoginBtn() {
  const { data: session } = useSession();

  // @ts-ignore
  const handleSignout = (e) => {
    e.preventDefault();
    signOut();
  };

  if (session) {
    return (
      <div>
        <a
          href="#"
          onClick={handleSignout}
          className="fr-btn fr-btn--secondary"
        >
          Déco
        </a>
      </div>
    );
  } else {
    return (
      <a href="/login" className="fr-btn fr-btn--secondary">
        Se connecter
      </a>
    );
  }
}
