// Components
import { Footer } from "@codegouvfr/react-dsfr/Footer";

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
              categoryName: "A propos",
              links: [
                {
                  linkProps: {
                    href:"/a-propos",
                  },
                  text: "Présentation",
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
                    href:"https://rnb-fr.gitbook.io/documentation/budget"
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
