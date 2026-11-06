'use client';

// Components
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';

// Auth
import { getSession, signOut } from 'next-auth/react';

// Nav & routes
import { usePathname } from 'next/navigation';

// Fèves
import { useUserFeves } from '@/utils/feve';

import * as Sentry from '@sentry/nextjs';

export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleSignout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const session = await getSession();
    if (session?.authProvider === 'proconnect') {
      try {
        const res = await fetch('/api/auth/proconnect-logout');
        if (!res.ok) throw new Error(`proconnect-logout failed: ${res.status}`);
        const { logout_url } = await res.json();
        if (logout_url) {
          await signOut({ redirect: false });
          window.location.href = logout_url;
          return;
        }
      } catch (error) {
        // Fall back to a local sign-out: the ProConnect session stays open
        Sentry.captureException(error);
      }
    }
    signOut();
  };

  const menuItems: Array<{
    text: string;
    isActive: boolean;
    linkProps: { href: string; onClick?: (e: React.MouseEvent) => void };
  }> = [
    {
      text: "Mes clés d'API",
      isActive: pathname === '/mon-compte/cles-api',
      linkProps: {
        href: '/mon-compte/cles-api',
      },
    },
  ];

  menuItems.push({
    text: 'Mes trophées',
    isActive: pathname === '/mon-compte/mes-trophees',
    linkProps: {
      href: '/mon-compte/mes-trophees',
    },
  });

  menuItems.push({
    text: 'Notifications',
    isActive: pathname === '/mon-compte/notifications',
    linkProps: {
      href: '/mon-compte/notifications',
    },
  });

  menuItems.push({
    text: 'Se déconnecter',
    isActive: false,
    linkProps: {
      onClick: handleSignout,
      href: '#',
    },
  });

  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
          <div className="fr-col-3">
            <SideMenu
              align="left"
              burgerMenuButtonText="Dans cette rubrique"
              items={menuItems}
            />
          </div>
          <div className="fr-col-9">{children}</div>
        </div>
      </div>
    </>
  );
}
