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
 * Formate la liste des validateurs en une énumération « display_name
 * (organization_name) », séparés par des virgules sauf le dernier, introduit par
 * « et ». Ex : "Jean Dupont (IGN), Marie Martin (INSEE) et Luc Petit (BAN)".
 * Les parenthèses sont omises pour un validateur sans organisation.
 */
export function formatValidatorNames(validatedBy: PublicUser[]): string {
  const parts = validatedBy.map((u) =>
    u.organization_name
      ? `${u.display_name} (${u.organization_name})`
      : u.display_name,
  );
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`;
}
