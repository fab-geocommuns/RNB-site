import { PublicUser } from '@/stores/map/map-slice';

/**
 * Indique si l'utilisateur courant (identifié par son username) fait partie
 * des validateurs du bâtiment.
 */
export function hasUserValidated(
  validatedBy: PublicUser[],
  username: string | undefined,
): boolean {
  if (!username) return false;
  return validatedBy.some((u) => u.username === username);
}

/**
 * Formate la liste des validateurs en une énumération de noms d'affichage
 * séparés par des virgules. Ex : "Jean Dupont, Marie Martin".
 */
export function formatValidatorNames(validatedBy: PublicUser[]): string {
  return validatedBy.map((u) => u.display_name).join(', ');
}
