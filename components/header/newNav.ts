import { newsletterModal } from '@/components/home/NewsletterModal';

export default function newNav(pathName: string) {
  return [
    {
      linkProps: {
        href: '/',
        target: '_self',
      },
      text: 'Accueil',
    },
    {
      linkProps: {
        href: '/cas-d-usage',
        target: '_self',
      },
      text: "Cas d'usage",
    },
    {
      text: 'Carte et API',
      megaMenu: {
        categories: [
          {
            categoryMainText: 'Intégrer',

            links: [
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments',
                  target: '_self',
                },
                text: 'API Bâtiments',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/exemples/selecteur-de-batiments',
                  target: '_self',
                },
                text: 'Sélécteur de bâtiments',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/tuiles-vectorielles',
                  target: '_self',
                },
                text: 'Tuiles vectorielles',
              },
              {
                linkProps: {
                  href: 'https://www.data.gouv.fr/datasets/referentiel-national-des-batiments/',
                  target: '_self',
                },
                text: 'Exports nationaux et départementaux',
              },
            ],
          },
          {
            categoryMainText: 'Consulter',
            links: [
              {
                linkProps: {
                  href: '/carte',
                  target: '_self',
                },
                text: 'Carte des bâtiments',
              },
              {
                linkProps: {
                  href: '/definition',
                  target: '_self',
                },
                text: 'Définition et standard',
              },
              {
                linkProps: {
                  href: '/outils-services/rapprochement',
                  target: '_self',
                },
                text: 'Bases contenant des ID-RNBs',
              },
            ],
          },
          {
            categoryMainText: 'Contribuer',
            links: [
              {
                linkProps: {
                  href: '/edition',
                  target: '_self',
                },
                text: "Outil d'édition",
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb',
                  target: '_self',
                },
                text: "API d'édition",
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb',
                  target: '_self',
                },
                text: "Guides d'éditions",
              },
            ],
          },
        ],
      },
    },
    {
      text: 'Ressources',
      megaMenu: {
        categories: [
          {
            categoryMainText: 'Ressources',

            links: [
              {
                linkProps: {
                  href: '/doc',
                },
                text: 'Documentation technique',
              },
              {
                linkProps: {
                  href: '/definition',
                },
                text: 'Définition et standard',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb',
                  target: '_self',
                },
                text: "Guide d'édition",
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/lexique-du-rnb',
                  target: '_self',
                },
                text: 'Lexique',
              },
              {
                linkProps: {
                  href: '/faq',
                  target: '_self',
                },
                text: 'FAQ',
              },
            ],
          },
          {
            categoryMainText: 'Actualités',
            links: [
              {
                linkProps: {
                  href: '/blog',
                },
                text: 'Dernières informations',
              },
              {
                linkProps: {
                  href: '#',
                  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    newsletterModal.open();
                  },
                },
                text: "S'abonner à la newsletter",
              },
            ],
          },
          {
            categoryMainText: 'Le RNB',
            links: [
              {
                linkProps: {
                  href: '/a-propos',
                },
                text: 'Présentation',
              },
              {
                linkProps: {
                  href: '/stats',
                },
                text: 'Statistiques',
              },
              {
                linkProps: {
                  href: 'https://stats.uptimerobot.com/n0w4LilK0r',
                  target: '_self',
                },
                text: 'Statut du service',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/a-propos/mentions-legales-et-politique-de-confidentialite',
                  target: '_self',
                },
                text: 'Mentions légales',
              },
            ],
          },
        ],
      },
    },
  ];
}
