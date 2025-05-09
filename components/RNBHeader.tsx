'use client';

// Comps
import { Header } from '@codegouvfr/react-dsfr/Header';
import { Badge } from '@codegouvfr/react-dsfr/Badge';

// Auth
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

// Routes
import { usePathname } from 'next/navigation';

// Logo
import logo from '@/public/images/logo.png';
import { useEffect, useState } from 'react';
import EditRNBButton from './EditRNBButton';

type Props = {
  withNavigation?: boolean;
};

export default function RNBHeader({ withNavigation = true }: Props) {
  const { data: session } = useSession();

  const pathname = usePathname();
  const [redirectUrl, setRedirectUrl] = useState(pathname);

  const [quickActions, setQuickActions] = useState([]);
  const [title, setTitle] = useState('Référentiel National des Bâtiments');

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
      isActive: pathname.startsWith('/blog'),
      text: "Cas d'usage",
      linkProps: {
        href: '/blog',
      },
    },
    {
      isActive: pathname.startsWith('/faq'),
      text: 'Foire aux questions',
      linkProps: {
        href: '/faq',
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

  // @ts-ignore
  const handleSignout = (e) => {
    e.preventDefault();
    signOut();
  };

  useEffect(() => {
    setRedirectUrl(window.location.href);
  }, [pathname]);

  const enableEditionMode =
    process.env.NEXT_PUBLIC_ENABLE_EDITION_MODE === 'true';

  const editBtn = <EditRNBButton />;

  // Change quick actions and title based on current page and user session
  useEffect(() => {
    let newQuickActions = [];

    // Show some quick actions depending on the current page
    // User is on the edition page or not
    if (pathname === '/edition') {
      // Back to site
      let goBackToSiteQA = {
        iconId: 'fr-icon-arrow-left-line',
        linkProps: {
          href: '/',
        },
        text: 'Retour au site',
      };
      newQuickActions.push(goBackToSiteQA);

      // Title

      setTitle(
        // @ts-ignore
        <>
          Référentiel National des Bâtiments
          <br />
          <Badge as="span" noIcon severity="success" small>
            Mode Édition
          </Badge>
        </>,
      );

      // Edition guide
      let editionGuide = {
        iconId: 'fr-icon-community-line',
        linkProps: {
          href: '/guide',
        },
        text: "Guide d'édition",
      };
      newQuickActions.push(editionGuide);
    } else {
      // Go to Edition

      if (enableEditionMode) {
        let goToEditionQA = editBtn;
        newQuickActions.push(goToEditionQA);
      }

      setTitle('Référentiel National des Bâtiments');
    }

    // Show some quick actions depending on the login status
    if (session) {
      // Add the "Se déconnecter" action
      let logoutQA = {
        iconId: 'fr-icon-logout-box-r-line',
        linkProps: {
          href: '#',
          // @ts-ignore
          onClick: (e) => {
            handleSignout(e);
          },
        },
        text: 'Se déconnecter',
      };
      newQuickActions.push(logoutQA);
    } else {
      let loginQA = {
        iconId: 'fr-icon-lock-line',
        linkProps: {
          href: '/login?redirect=' + redirectUrl,
        },
        text: 'Se connecter',
      };
      newQuickActions.push(loginQA);
    }

    // Set
    // @ts-ignore
    setQuickActions(newQuickActions);
  }, [pathname, session]);

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
        serviceTitle={title}
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
        // @ts-ignore
        quickAccessItems={quickActions}
      />
    </>
  );
}
