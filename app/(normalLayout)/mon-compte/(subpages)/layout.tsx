'use client';

// Components
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';

// Auth
import { signOut } from 'next-auth/react';

// Nav & routes
import { usePathname } from 'next/navigation';

export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // @ts-ignore
  const handleSignout = (e) => {
    e.preventDefault();
    signOut();
  };

  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
          <div className="fr-col-3">
            <SideMenu
              align="left"
              burgerMenuButtonText="Dans cette rubrique"
              items={[
                {
                  text: "Mes clés d'API",
                  isActive: pathname === '/mon-compte/cles-api',
                  linkProps: {
                    href: '/mon-compte/cles-api',
                  },
                },

                {
                  text: 'Se déconnecter',

                  linkProps: {
                    onClick: (e) => {
                      handleSignout(e);
                    },
                    href: '#',
                  },
                },
              ]}
            />
          </div>
          <div className="fr-col-9">{children}</div>
        </div>
      </div>
    </>
  );
}
