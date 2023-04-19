import '@gouvfr/dsfr/dist/dsfr/dsfr.min.css'

export const metadata = {
  title: 'Gestion des ADS pour le Référentiel National des Bâtiments',
  description: 'Gestion des Autorisations de Droit des Sols',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (    
    <html lang="fr">
      <body>
        <div className="fr-container">
        {children}
        </div>
        
        </body>
    </html>
  )
}
