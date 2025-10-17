import { newsletterModal } from '@/components/home/NewsletterModal';
import linkedInIcon from '@/public/icons/linkedin-box-fill.svg';
import mailIcon from '@/public/icons/mail-line.svg';
import forumIcon from '@/public/icons/message-2-line.svg';
import ImageNext from 'next/image';
import styles from '@/styles/nav.module.scss';

function ContactIcon({ src, alt }: { src: string; alt: string }) {
  return <ImageNext src={src} alt={alt} className={styles.contactIcon} />;
}

function LinkedInLink() {
  return (
    <a
      title="Nous suivre sur LinkedIn"
      href="https://www.linkedin.com/company/r-f-rentiel-national-des-b-timents/"
      className={styles.contactLink}
    >
      <ContactIcon src={linkedInIcon} alt="LinkedIn" />
    </a>
  );
}

function MailLink() {
  return (
    <a
      title="Nous écrire"
      href="mailto:contact@rnb.fr"
      className={styles.contactLink}
    >
      <ContactIcon src={mailIcon} alt="Mail" />
    </a>
  );
}

function ForumLink() {
  return (
    <a
      title="Nous contacter sur le forum des Géocommuns"
      href="https://forum.geocommuns.fr/c/rnb/11"
      className={styles.contactLink}
    >
      <ContactIcon src={forumIcon} alt="Forum" />
    </a>
  );
}

function ContactUs() {
  return (
    <>
      Nous contacter : <LinkedInLink /> <MailLink /> <ForumLink />
    </>
  );
}

export default function newNav(pathName: string) {
  const contactUs = <ContactUs />;
  return [
    {
      linkProps: {
        href: '/',
        target: '_self',
      },
      text: 'Accueil',
      isActive: pathName === '/',
    },
    {
      linkProps: {
        href: '/cas',
        target: '_self',
      },
      text: "Cas d'usage",
      isActive: pathName === '/cas',
    },
    {
      text: 'Carte et API',
      megaMenu: {
        categories: [
          {
            categoryMainText: 'Consulter',
            links: [
              {
                linkProps: {
                  href: '/carte',
                  target: '_self',
                },
                text: 'Carte des bâtiments',
                isActive: pathName === '/carte',
              },
              {
                linkProps: {
                  href: '/definition',
                  target: '_self',
                },
                text: 'Définition et standard',
                isActive: pathName === '/definition',
              },
              {
                linkProps: {
                  href: '/outils-services/rapprochement',
                  target: '_self',
                },
                text: 'Bases contenant des ID-RNBs',
                isActive: pathName === '/outils-services/rapprochement',
              },
            ],
          },
          {
            categoryMainText: 'Intégrer',

            links: [
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments',
                  target: '_blank',
                },
                text: 'API Bâtiments',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/exemples/selecteur-de-batiments',
                  target: '_blank',
                },
                text: 'Sélécteur de bâtiments',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/tuiles-vectorielles',
                  target: '_blank',
                },
                text: 'Tuiles vectorielles',
              },
              {
                linkProps: {
                  href: 'https://www.data.gouv.fr/datasets/referentiel-national-des-batiments/',
                  target: '_blank',
                },
                text: 'Exports nationaux et départementaux',
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
                isActive: pathName === '/edition',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb',
                  target: '_blank',
                },
                text: "API d'édition",
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb',
                  target: '_blank',
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
            categoryMainText: 'Découvrir le RNB',
            links: [
              {
                linkProps: {
                  href: '/a-propos',
                },
                text: 'Présentation',
                isActive: pathName === '/a-propos',
              },
              {
                linkProps: {
                  href: '/definition',
                },
                text: 'Définition et standard',
                isActive: pathName === '/definition',
              },
              {
                linkProps: {
                  href: '/faq',
                  target: '_self',
                },
                text: 'FAQ',
                isActive: pathName === '/faq',
              },
              {
                linkProps: {
                  href: '/cas',
                  target: '_self',
                },
                text: "Cas d'usage",
                isActive: pathName === '/cas',
              },
            ],
          },
          {
            categoryMainText: 'Approfondir',

            links: [
              {
                linkProps: {
                  href: '/doc',
                  target: '_blank',
                },
                text: 'Documentation technique',
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb/guide-dedition-du-rnb',
                  target: '_blank',
                },
                text: "Guide d'édition",
              },
              {
                linkProps: {
                  href: 'https://rnb-fr.gitbook.io/documentation/lexique-du-rnb',
                  target: '_blank',
                },
                text: 'Lexique',
              },
              {
                linkProps: {
                  href: '/stats',
                },
                text: 'Statistiques',
                isActive: pathName === '/stats',
              },
            ],
          },
          {
            categoryMainText: 'Suivre',
            links: [
              {
                linkProps: {
                  href: '/blog',
                },
                text: 'Dernières informations',
                isActive: pathName === '/blog',
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
              {
                linkProps: {
                  href: '#',
                  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {},
                  target: '_self',
                },
                text: contactUs,
              },
            ],
          },
        ],
      },
    },
  ];
}
