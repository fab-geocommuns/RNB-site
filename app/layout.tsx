// DSFR and styles
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getColorSchemeHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getColorSchemeHtmlAttributes";
import StartDsfr from "@/app/StartDsfr";
import { defaultColorScheme } from "@/app/defaultColorScheme";
import  "@/styles/global.scss";

// Auth
import RNBSessionProvider from '@/components/SessionProvider'

// Components
import RNBHeader from "@/components/RNBHeader";
import { Analytics } from '@vercel/analytics/react';
import FlashMessage from "@/components/FlashMessage";


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
          
          
          

        </DsfrProvider>
        </RNBSessionProvider>
        <Analytics />
        </body>
    </html>
    
  )
}



