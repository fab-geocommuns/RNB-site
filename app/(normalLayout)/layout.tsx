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
          homeLinkProps={{
            href: '/',
            title: 'Accueil RNB',
          }}
          ></Footer>
      </>
    )
  }