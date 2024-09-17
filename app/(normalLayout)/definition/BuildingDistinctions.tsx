'use client';

import { useEffect, useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import { BuildingExample } from '@/app/(normalLayout)/definition/BuildingList.type';

export default function BuildingDistinctions({
  buildingList,
}: {
  buildingList: BuildingExample[];
}) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleHashChange = () => {
        setSelectedBuildingId(
          window.location.hash ? window.location.hash.substring(1) : null,
        );
      };

      handleHashChange();

      window.addEventListener('hashchange', handleHashChange);

      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    }
  }, []);

  return (
    <div className="fr-col-12 fr-col-md-8">
      <h2 className="block__title">
        Distinction entre un bâtiment unique et plusieurs bâtiments
      </h2>

      <p>
        <strong>
          Vous vous demandez si la construction constitue un ou plusieurs
          bâtiments ?
        </strong>{' '}
        <br />
        Parcourez les exemples ci-dessous apportant un éclairage sur les cas
        particuliers rencontrés.
      </p>

      <div className={fr.cx('fr-accordions-group')}>
        {buildingList
          .filter((cas) => !!cas.distinctionBetweenSingleAndMultipleText)
          .map((cas) => (
            <Accordion
              key={cas.id}
              label={<span id={cas.id}>{cas.title}</span>}
              onExpandedChange={(value) =>
                setSelectedBuildingId(!value ? cas.id : null)
              }
              expanded={selectedBuildingId === cas.id}
            >
              {cas.distinctionBetweenSingleAndMultipleText!}
            </Accordion>
          ))}
      </div>
    </div>
  );
}
