import { Tooltip } from '@codegouvfr/react-dsfr/Tooltip';

import styles from '@/styles/organizationName.module.scss';

/**
 * Affiche le nom d'une organisation.
 *
 * Si un nom court (`shortName`) est renseigné, il est affiché et le nom complet
 * (`name`) apparaît dans un tooltip DSFR au survol. Sinon, le nom complet est
 * affiché tel quel. Ne rend rien si aucun nom n'est disponible.
 */
export function OrganizationName({
  name,
  shortName,
}: {
  name?: string | null;
  shortName?: string | null;
}) {
  const full = name?.trim() || null;
  const short = shortName?.trim() || null;

  if (!full && !short) return null;

  if (short && full && short !== full) {
    return (
      <Tooltip kind="hover" title={full} className={styles.tooltip}>
        <span className={styles.shortName}>{short}</span>
      </Tooltip>
    );
  }

  return <>{short ?? full}</>;
}
