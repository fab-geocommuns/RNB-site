export default function oldNav(pathname: string) {
  return [
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
}
