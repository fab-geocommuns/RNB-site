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
