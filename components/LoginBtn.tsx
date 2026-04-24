'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function LoginBtn() {
  const { data: session } = useSession();

  const handleSignout = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (session?.authProvider === 'proconnect') {
      try {
        const res = await fetch(
          `/api/auth/proconnect-logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`,
        );
        const data = await res.json();

        if (data.logout_url) {
          await signOut({ redirect: false });
          window.location.href = data.logout_url;
          return;
        }
      } catch {
        // Fall back to simple signOut if ProConnect logout fails
      }
    }

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
      <Link href="/connexion" className="fr-btn fr-btn--secondary">
        Se connecter
      </Link>
    );
  }
}
