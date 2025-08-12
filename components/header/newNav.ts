export default function newNav(pathName: string) {
  return [
    {
      linkProps: {
        href: '#',
        target: '_self',
      },
      text: 'Accueil',
    },
    {
      linkProps: {
        href: '#',
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
                  href: '#',
                },
                text: 'API Bâtiments',
              },
              {
                linkProps: {
                  href: '#',
                },
                text: 'Sélécteur de bâtiments',
              },
              {
                linkProps: {
                  href: '#',
                },
                text: 'Tuiles vectorielles',
              },
              {
                linkProps: {
                  href: '#',
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
                  href: '#',
                },
                text: 'Carte des bâtiments',
              },
              {
                linkProps: {
                  href: '#',
                },
                text: 'Définition et standard',
              },
              {
                linkProps: {
                  href: '#',
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
                  href: '#',
                },
                text: "Outil d'édition",
              },
              {
                linkProps: {
                  href: '#',
                },
                text: "API d'édition",
              },
              {
                linkProps: {
                  href: '#',
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
                  href: '#',
                },
                text: 'Documentation technique',
              },
              {
                linkProps: {
                  href: '#',
                },
                text: 'Définition et standard',
              },
              {
                linkProps: {
                  href: '#',
                },
                text: "Guide d'édition",
              },
              {
                linkProps: {
                  href: '#',
                },
                text: 'Lexique',
              },
              {
                linkProps: {
                  href: '#',
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
                  href: '#',
                },
                text: 'Dernières informations',
              },
              {
                linkProps: {
                  href: '#',
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
                  href: '#',
                },
                text: 'Présentation',
              },
              {
                linkProps: {
                  href: '#',
                },
                text: 'Statistiques',
              },
              {
                linkProps: {
                  href: '#',
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
