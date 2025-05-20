'use client';

// Comps
import { Header } from '@codegouvfr/react-dsfr/Header';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { Notice } from '@codegouvfr/react-dsfr/Notice';
import { createModal } from '@codegouvfr/react-dsfr/Modal';

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

const explainModal = createModal({
  id: 'explain-edit-rnb',
  isOpenedByDefault: false,
});

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

  useEffect(() => {
    setRedirectUrl(window.location.href);
  }, [pathname]);

  const enableEditionMode =
    process.env.NEXT_PUBLIC_ENABLE_EDITION_MODE === 'true';

  const editBtn = <EditRNBButton modal={explainModal} />;

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
      // My account
      let myAccountQA = {
        iconId: 'ri-arrow-down-circle-line',
        linkProps: {
          href: '/mon-compte',
        },
        text: 'Mon compte',
      };
      newQuickActions.push(myAccountQA);
    } else {
      let loginQA = {
        iconId: 'fr-icon-account-circle-line',
        linkProps: {
          href: '/login?redirect=' + redirectUrl,
        },
        text: 'Se connecter',
      };
      newQuickActions.push(loginQA);

      let registerQA = {
        iconId: 'fr-icon-add-circle-fill',
        linkProps: {
          href: '/login',
        },
        text: "S'inscrire",
      };
      newQuickActions.push(registerQA);
    }

    // Set
    // @ts-ignore
    setQuickActions(newQuickActions);
  }, [pathname, session]);

  return (
    <>
      <explainModal.Component title="Participer au Référentiel National des Bâtiments">
        <Notice
          title="Phase de test :"
          description="le service d'édition est en phase de test en vue d'un démarrage
            officiel fin juin 2025."
          severity="info"
          isClosable={false}
          className="fr-my-4w"
        />

        <p>
          Pour être constamment tenu à jour, le RNB est alimenté par de grandes
          bases de données nationales mais aussi par les contributions de ceux
          ayant une connaissance fine de leur territoire. Tout le monde,
          services de l&apos;État, collectivités, citoyens, entreprises ou
          associations est invité à apporter sa pierre au RNB.
        </p>
        <p>
          Partager la connaissance de votre territoire, c&apos;est bénéficier en
          retour des améliorations apportées par les autres pour une donnée
          bâtimentaire la plus proche du terrain.
        </p>
        <p className="fr-mb-4w">
          Le RNB est entièrement transparent. Chaque contribution est
          historisée, tracée et mise à disposition de tous.
        </p>
        <div className="fr-btns-group fr-btns-group--inline-md">
          <a href="/login" className="fr-btn fr-btn--primary">
            S&apos;inscrire
          </a>
          <a href="/guide" className="fr-btn fr-btn--tertiary">
            Consulter le guide d&apos;édition
          </a>
        </div>
      </explainModal.Component>
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
