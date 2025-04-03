'use client';

// Comps
import { Header } from '@codegouvfr/react-dsfr/Header';

// Auth
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

// Routes
import { usePathname } from 'next/navigation';

// Logo
import logo from '@/public/images/logo.png';
import { use, useEffect, useState } from 'react';
import ToggleEditMode from './ToggleEditMode';

type Props = {
  withNavigation?: boolean;
};

export default function RNBHeader({ withNavigation = true }: Props) {
  const { data: session } = useSession();

  const pathname = usePathname();
  const [redirectUrl, setRedirectUrl] = useState(pathname);

  const nav = [
    {
      isActive: pathname === '/',
      text: 'Accueil',
      linkProps: {
        href: '/',
      },
    },
    {
      isActive: pathname === '/carte',
      text: 'Carte',
      linkProps: {
        href: '/carte',
      },
    },
    {
      isActive: pathname.startsWith('/outils-services'),
      text: 'Outils & services',
      linkProps: {
        href: '/outils-services',
      },
    },
    {
      isActive: pathname === '/definition',
      text: 'Définition & Standard',
      linkProps: {
        href: '/definition',
      },
    },
    {
      isActive: pathname.startsWith('/cas'),
      text: "Cas d'usage",
      linkProps: {
        href: '/cas',
      },
    },
    {
      isActive: pathname.startsWith('/blog'),
      text: 'Actualités',
      linkProps: {
        href: '/blog',
      },
    },
    {
      isActive: pathname === '/a-propos',
      text: 'À propos',
      linkProps: {
        href: '/a-propos',
      },
    },
    {
      isActive: pathname === '/contact',
      text: 'Contact',
      linkProps: {
        href: '/contact',
      },
    },
  ];

  const handleSignout = (e) => {
    e.preventDefault();
    signOut();
  };

  let faqQA = {
    iconId: 'fr-icon-question-fill',
    linkProps: {
      href: '/faq',
    },
    text: 'Foire aux questions',
  };

  let logQA = {
    iconId: 'fr-icon-lock-line',
    linkProps: {
      href: '/login?redirect=' + redirectUrl,
    },
    text: 'Se connecter',
  };

  if (session) {
    logQA = {
      iconId: 'fr-icon-logout-box-r-line',
      linkProps: {
        href: '#',
        onClick: (e) => {
          handleSignout(e);
        },
      },
      text: 'Se déconnecter',
    };
  }

  useEffect(() => {
    setRedirectUrl(window.location.href);
  }, [pathname]);

  const editModeToggler = <ToggleEditMode />;

  const enableEditionMode = process.env.ENABLE_EDITION_MODE === 'true';
  const quickAccessItems = [
    faqQA,
    enableEditionMode ? editModeToggler : null,
    logQA,
  ];

  return (
    <>
      <Header
        brandTop={
          <>
            République
            <br />
            Française
          </>
        }
        serviceTitle="Référentiel National des Bâtiments"
        navigation={withNavigation && nav}
        homeLinkProps={{
          href: '/',
          title: 'Accueil RNB',
        }}
        operatorLogo={{
          alt: 'Référentiel National des Bâtiments',
          imgUrl: logo.src,
          orientation: 'vertical',
        }}
        quickAccessItems={quickAccessItems}
      />
    </>
  );
}
