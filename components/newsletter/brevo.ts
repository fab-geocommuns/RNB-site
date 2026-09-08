// Endpoint public du formulaire Brevo "Inscription newsletter site" (URL
// /serve/). Non défini, aucune requête n'est envoyée : un poste de dev
// n'inscrit personne à la vraie infolettre.
export const BREVO_NEWSLETTER_URL =
  process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_URL;

export const GENERIC_ERROR =
  'Une erreur est survenue. Merci de réessayer plus tard.';

type BrevoErrorResponse = {
  errors?: Record<string, unknown>;
};

/** Renvoie `null` en cas de succès, sinon le message d'erreur à afficher. */
export async function subscribeToNewsletter(
  formData: FormData,
): Promise<string | null> {
  if (!BREVO_NEWSLETTER_URL) {
    return "Inscription désactivée : NEXT_PUBLIC_BREVO_NEWSLETTER_URL n'est pas défini.";
  }

  const response = await fetch(`${BREVO_NEWSLETTER_URL}?isAjax=1`, {
    method: 'POST',
    body: formData,
  });

  if (response.ok) return null;

  const data: BrevoErrorResponse = await response.json();

  if (data.errors?.EMAIL)
    return 'Veuillez renseigner une adresse email valide.';
  if (data.errors?.['cf-turnstile-response'])
    return 'La vérification anti-robot a échoué. Merci de réessayer.';
  return GENERIC_ERROR;
}
