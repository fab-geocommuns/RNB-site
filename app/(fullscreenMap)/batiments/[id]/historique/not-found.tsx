import ErrorPage from '@/components/ErrorPage';

export default function NotFound() {
  return (
    <ErrorPage
      title="Bâtiment non trouvé"
      code="Erreur 404"
      lead="Le bâtiment que vous recherchez n'existe pas ou son historique n'est pas disponible."
      buttons={[{ children: "Page d'accueil", linkProps: { href: '/' } }]}
    />
  );
}
