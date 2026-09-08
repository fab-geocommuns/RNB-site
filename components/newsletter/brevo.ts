// Endpoint public du formulaire Brevo "Inscription newsletter site" (URL
// /serve/), pas un secret.
export const BREVO_NEWSLETTER_URL =
  'https://9468302f.sibforms.com/serve/MUIFAPYq1oJpmEs2x6ie3BS9jHJojZlq9vxvUbqk84cPxzdcyRJ9b2ckp_JOdn60FlypsKHryyzjRAoQjODmEDPmgrJFMopfS3KOYUr3EThWFnnfs-WFawbi0L-cUm6xzHhRKVFVWulC8jWJYrBcOexerRBI-k9cs6vPe84tyEstqpKcyRW_5ITKvlF8CZa6-pvnILLRJ5UxZSvm';

export const GENERIC_ERROR =
  'Une erreur est survenue. Merci de réessayer plus tard.';

type BrevoErrorResponse = {
  errors?: Record<string, unknown>;
};

/** Renvoie `null` en cas de succès, sinon le message d'erreur à afficher. */
export async function subscribeToNewsletter(
  formData: FormData,
): Promise<string | null> {
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
