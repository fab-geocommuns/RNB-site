// Components
import { Footer } from "@codegouvfr/react-dsfr/Footer";

// Settings
import settings from '@/logic/settings'
import Hotjar from "@hotjar/browser";

export default function WithFooterLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {

    Hotjar.init(settings.hotjarId, settings.hotjarVersion)

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