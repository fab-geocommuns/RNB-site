import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="fr-container">
      <div className="fr-grid-row">
        <div className="fr-col-12 fr-py-12v">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
              <div className="text-center">
                <h1>Bâtiment non trouvé</h1>
                <p className="fr-text--lead">
                  Le bâtiment que vous recherchez n&apos;existe pas ou son
                  historique n&apos;est pas disponible.
                </p>

                <div className="fr-mt-6v">
                  <Link href="/" className="fr-btn">
                    Retour à l&apos;accueil
                  </Link>
                </div>

                <div className="fr-mt-4v">
                  <p className="fr-text--sm">Erreur 404 - Page non trouvée</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
