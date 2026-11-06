import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { footerId } from '@/components/SkipLinks';

export default function RNBFooter() {
  return (
    <Footer
      id={footerId}
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
                href: 'https://www.linkedin.com/company/r-f-rentiel-national-des-b-timents/?originalSubdomain=fr',
              },
              text: 'LinkedIn',
            },
            {
              linkProps: {
                href: 'mailto:rnb@beta.gouv.fr',
              },
              text: 'Nous écrire',
            },
            {
              linkProps: {
                href: 'https://forum.geocommuns.fr/c/rnb/11',
              },
              text: 'Forum des Géocommuns',
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
              text: 'GitHub',
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
  );
}
