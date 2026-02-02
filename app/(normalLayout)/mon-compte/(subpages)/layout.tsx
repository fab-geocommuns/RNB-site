'use client';

// Components
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';

// Auth
import { signOut, useSession } from 'next-auth/react';

// Nav & routes
import { usePathname } from 'next/navigation';

// Fèves
import { useUserFeves } from '@/utils/feve';

export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: userFeves } = useUserFeves(session?.username ?? undefined);

  const hasFeves = userFeves && userFeves.length > 0;

  // @ts-ignore
  const handleSignout = (e) => {
    e.preventDefault();
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
    text: 'Se déconnecter',
    isActive: false,
    linkProps: {
      onClick: (e: React.MouseEvent) => {
        handleSignout(e);
      },
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
