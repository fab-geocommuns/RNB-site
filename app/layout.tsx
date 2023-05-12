// DSFR and styles
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getColorSchemeHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getColorSchemeHtmlAttributes";
import StartDsfr from "./StartDsfr";
import { defaultColorScheme } from "./defaultColorScheme";
import  "./global.css";

// Auth
import RNBSessionProvider from '@/components/SessionProvider'

// Components
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Analytics } from '@vercel/analytics/react';
import LoginBtn from "@/components/LoginBtn";

export const metadata = {
  title: 'Référentiel National des Bâtiments',
  description: '...',
}


const nav = [
  {
    text: 'Accueil',
    linkProps: {
      href: '/',
    }
  },
  {
    text:"Carte",
    linkProps: {
      href: '/carte',
    }
  },
  {
    text:"Définition du bâtiment",
    linkProps: {
      href: '/definition',
    }
  },
  // {
  //   text:"Gestion des ADS",
  //   linkProps: {
  //     href: '/ads',
  //   }
  // },
]

export default function RootLayout({
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
          <Header 
          brandTop={<>République<br/>Française</>}
          serviceTitle="RNB"
          serviceTagline="Le Référentiel National des Bâtiments"
          navigation={nav}
          homeLinkProps={{
            href: '/',
            title: 'Accueil RNB',
          }}
           />

          <LoginBtn />
          
          {children}
          
        

        </DsfrProvider>
        </RNBSessionProvider>
        <Analytics />
        </body>
    </html>
    
  )
}



