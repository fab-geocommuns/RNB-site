// SEO
import { Metadata } from 'next'

// Components
import { Footer } from "@codegouvfr/react-dsfr/Footer";

export const metadata: Metadata = {
  title: {
    default: "Référentiel National des Bâtiments",
    template: "%s | RNB",
  },
  description: "Référencer l'intégralité des bâtiments du territoire français au sein de données et d'outils libres."
}

export default function WithFooterLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {

    return (
      <>
   
        {children}
        <Footer
          brandTop={<>République<br/>Française</>}
          accessibility="partially compliant"
          linkList={[
            {
              categoryName: "À propos",
              links: [
                {
                  linkProps: {
                    href:"/a-propos",
                  },
                  text: "Présentation",
                },
                {
                  linkProps: {
                    href:"/blog",
                  },
                  text: "Actualités",
                },
                {
                  linkProps: {
                    href:"/faq",
                  },
                  text: "Foire aux questions",
                },
                {
                  linkProps: {
                    href:"/contact",
                  },
                  text: "Contact",
                },
                {
                  linkProps: {
                    href:"https://rnb-fr.gitbook.io/documentation/a-propos/budget"
                  },
                  text: "Budget",
                }
              ]
            },
            {
              categoryName: "Outils pour développeurs",
              links: [
                {
                  linkProps: {
                    href:"/doc",
                  },
                  text: "Documentation",
                },
                {
                  linkProps: {
                    href:"https://rnb-fr.gitbook.io/documentation/api-et-outils/liste-des-api-et-outils-du-rnb"
                  },
                  text: "Nos API"
                },
                {
                  linkProps: {
                    href:"https://github.com/fab-geocommuns/RNB-site"
                  },
                  text: "Github"

                }, 
                {
                  linkProps: {
                    href: "https://stats.uptimerobot.com/n0w4LilK0r",
                  },
                  text: "Statut des services",

                }
              ]
            }
          ]}
          homeLinkProps={{
            href: '/',
            title: 'Accueil RNB',
          }}
          ></Footer>
      </>
    )
  }
