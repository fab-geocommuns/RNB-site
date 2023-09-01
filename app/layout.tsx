// DSFR and styles
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getColorSchemeHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getColorSchemeHtmlAttributes";
import StartDsfr from "./StartDsfr";
import { defaultColorScheme } from "./defaultColorScheme";
import  "./global.css";

// Auth
import RNBSessionProvider from '@/components/SessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Logos
import logoAdeme from '@/public/images/logos/ademe.svg'
import logoCstb from '@/public/images/logos/cstb.png'
import logoIgn from '@/public/images/logos/ign.png'
import logoDgaln from '@/public/images/logos/dgaln.png'

// Components
import RNBHeader from "@/components/RNBHeader";
import { Analytics } from '@vercel/analytics/react';
import FlashMessage from "@/components/FlashMessage";
import { Footer } from "@codegouvfr/react-dsfr/Footer";

export const metadata = {
  title: 'Référentiel National des Bâtiments',
  description: '...',
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {



  return (    
    
    <html lang="fr" {...getColorSchemeHtmlAttributes({ defaultColorScheme })} >
      <head>
        <StartDsfr />
        <DsfrHead defaultColorScheme={defaultColorScheme} />
      </head>
      <body>
        <RNBSessionProvider>
        <DsfrProvider defaultColorScheme={defaultColorScheme}>
          <RNBHeader />
          <FlashMessage />
          {children}
          
          
          <Footer
          brandTop={<>République<br/>Française</>}
          accessibility="partially compliant"
          homeLinkProps={{
            href: '/',
            title: 'Accueil RNB',
          }}
      
          
         
          
          ></Footer>

        </DsfrProvider>
        </RNBSessionProvider>
        <Analytics />
        </body>
    </html>
    
  )
}



