// SEO
import { Metadata } from 'next';

// Components
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import RNBHeader from '@/components/RNBHeader';
import { StartDsfrOnHydration } from '@codegouvfr/react-dsfr/next-app-router';

export const metadata: Metadata = {
  title: {
    default: 'Référentiel National des Bâtiments',
    template: '%s | RNB',
  },
  description:
    "Référencer l'intégralité des bâtiments du territoire français au sein de données et d'outils libres.",
};

export default function WithFooterLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RNBHeader />
      <StartDsfrOnHydration />
      {children}
      <Footer
        brandTop={
          <>
            République
            <br />
            Française
          </>
        }
        accessibility="non compliant"
        accessibilityLinkProps={{
          href: '/accessibilite',
          title: "En savoir plus sur l'accessibilité de ce site",
        }}
        linkList={[
          {
            categoryName: 'RNB',
            links: [
              {
                linkProps: {
                  href: '/a-propos',
                },
                text: 'À propos',
              },
              {
                linkProps: {
                  href: '/faq',
                },
                text: 'Foire aux questions',
              },
              {
                linkProps: {
                  href: '/blog',
                },
                text: 'Actualités',
              },

              {
                linkProps: {
                  href: '/stats',
                },
                text: 'Statistiques',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/a-propos/budget',
                },
                text: 'Budget',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/a-propos/mentions-legales-et-politique-de-confidentialite',
                },
                text: 'Mentions légales',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/a-propos/mentions-legales-et-politique-de-confidentialite',
                },
                text: 'Politique de confidentialité',
              },
            ],
          },
          {
            categoryName: 'Contact',
            links: [
              {
                linkProps: {
                  href: '/contact',
                },
                text: 'Nous écrire',
              },

              {
                linkProps: {
                  href: 'https://www.linkedin.com/company/r-f-rentiel-national-des-b-timents/?originalSubdomain=fr',
                },
                text: 'LinkedIn',
              },
              {
                linkProps: {
                  href: 'https://matrix.to/#/#rnb:matrix.org',
                },
                text: 'Salons de discussion',
              },
            ],
          },
          {
            categoryName: 'Outils pour développeurs',
            links: [
              {
                linkProps: {
                  href: '/doc',
                },
                text: 'Documentation',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/liste-des-api-et-outils-du-rnb',
                },
                text: 'Nos API',
              },
              {
                linkProps: {
                  href: 'https://www.data.gouv.fr/fr/organizations/referentiel-national-des-batiments/#/datasets',
                },
                text: 'Sur data.gouv.fr',
              },
              {
                linkProps: {
                  href: 'https://github.com/fab-geocommuns/RNB-site',
                },
                text: 'Github',
              },
              {
                linkProps: {
                  href: 'https://stats.uptimerobot.com/n0w4LilK0r',
                },
                text: 'Statut des services',
              },
            ],
          },
        ]}
        homeLinkProps={{
          href: '/',
          title: 'Accueil RNB',
        }}
      ></Footer>
    </>
  );
}
