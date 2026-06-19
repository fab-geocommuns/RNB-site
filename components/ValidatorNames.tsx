import { Fragment } from 'react';

import { PublicUser } from '@/stores/map/map-slice';
import { OrganizationName } from '@/components/OrganizationName';

/**
 * Énumère les validateurs sous la forme « username (organisation) », séparés par
 * des virgules sauf le dernier, introduit par « et ».
 * Ex : "jdupont (IGN), mmartin (INSEE) et lpetit (BAN)".
 * Les parenthèses sont omises pour un validateur sans organisation, et le nom de
 * l'organisation suit la règle de {@link OrganizationName} (nom court + tooltip).
 */
export function ValidatorNames({ validatedBy }: { validatedBy: PublicUser[] }) {
  return (
    <>
      {validatedBy.map((u, i) => {
        const separator =
          i === 0 ? '' : i === validatedBy.length - 1 ? ' et ' : ', ';
        const hasOrganization =
          u.organization_short_name || u.organization_name;

        return (
          <Fragment key={u.id}>
            {separator}
            {u.username}
            {hasOrganization && (
              <>
                {' ('}
                <OrganizationName
                  name={u.organization_name}
                  shortName={u.organization_short_name}
                />
                {')'}
              </>
            )}
          </Fragment>
        );
      })}
    </>
  );
}
