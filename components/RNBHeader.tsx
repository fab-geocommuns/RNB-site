'use client';

// Comps
import { Header, type HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Link from 'next/link';
import newNav from '@/components/header/newNav';

// Auth
import { useSession } from 'next-auth/react';

// Routes
import { usePathname, useSearchParams } from 'next/navigation';

// Logo
import logo from '@/public/images/logo.png';
import EditRNBButton from './EditRNBButton';
import NewsletterModal from './home/NewsletterModal';
import SkipLinks, { headerId } from './SkipLinks';

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
  const searchParams = useSearchParams();
  const cleanedSearchParams = new URLSearchParams(searchParams.toString());
  cleanedSearchParams.delete('extra_layers');

  const nav = newNav(pathname);

  const enableEditionMode =
    process.env.NEXT_PUBLIC_ENABLE_EDITION_MODE === 'true';

  // Computed during render, not in an effect, so that the server sends the
  // header matching the session
  const isEditionPage = pathname === '/edition';
  const quickActions: (HeaderProps.QuickAccessItem | React.JSX.Element)[] = [];

  // Show some quick actions depending on the current page
  if (isEditionPage) {
    // Back to site
    const backToSiteUrl = `/carte?${cleanedSearchParams.toString()}`;
    quickActions.push({
      iconId: 'fr-icon-arrow-left-line',
      linkProps: {
        href: backToSiteUrl,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          window.location.href = backToSiteUrl;
        },
      },
      text: 'Retour au site',
    });

    // Edition guide
    quickActions.push({
      iconId: 'fr-icon-community-line',
      linkProps: {
        href: '/guide',
      },
      text: "Guide d'édition",
    });
  } else if (enableEditionMode) {
    // Go to Edition
    quickActions.push(<EditRNBButton modal={explainModal} />);
  }

  // Show some quick actions depending on the login status
  if (session) {
    quickActions.push({
      iconId: 'ri-arrow-down-circle-line',
      // @ts-ignore data-testid is not part of the DSFR link props
      linkProps: {
        href: '/mon-compte',
        'data-testid': 'my-account-button',
      },
      text: 'Mon compte',
    });
  } else {
    const search = searchParams.toString();
    const currentUrl = search ? `${pathname}?${search}` : pathname;
    quickActions.push(
      {
        iconId: 'fr-icon-account-circle-line',
        linkProps: {
          href: `/connexion?redirect=${encodeURIComponent(currentUrl)}`,
        },
        text: 'Se connecter',
      },
      {
        iconId: 'fr-icon-add-circle-fill',
        linkProps: {
          href: '/inscription',
        },
        text: "S'inscrire",
      },
    );
  }

  const title = isEditionPage ? (
    <>
      Référentiel National des Bâtiments
      <br />
      <Badge as="span" noIcon severity="info" small>
        Mode Édition
      </Badge>
    </>
  ) : (
    'Référentiel National des Bâtiments'
  );

  return (
    <>
      <NewsletterModal />
      <explainModal.Component title="Participer au Référentiel National des Bâtiments">
        <p className="fr-mt-4w">
          Pour être constamment tenu à jour, le RNB est alimenté par de grandes
          bases de données nationales mais aussi par les contributions de ceux
          ayant une connaissance fine de leur territoire. Tout le monde,
          services de l&apos;État, collectivités, citoyens, entreprises ou
          associations, est invité à apporter sa pierre au RNB.
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
          <Link href="/inscription" className="fr-btn fr-btn--primary">
            S&apos;inscrire
          </Link>
          <Link href="/guide" className="fr-btn fr-btn--tertiary">
            Consulter le guide d&apos;édition
          </Link>
        </div>
      </explainModal.Component>
      <SkipLinks withNavigation={withNavigation} />
      <Header
        id={headerId}
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
        quickAccessItems={quickActions}
      />
    </>
  );
}
