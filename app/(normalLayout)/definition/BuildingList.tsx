'use client';

import { Card } from '@codegouvfr/react-dsfr/Card';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { useMemo, useState } from 'react';
import styles from '@/styles/definition.module.scss';
import { BuildingExample } from '@/app/(normalLayout)/definition/BuildingList.type';

const normalize = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

type BuildingListProps = {
  buildingList: BuildingExample[];
};

export default function BuildingList({ buildingList }: BuildingListProps) {
  const [recherche, setRecherche] = useState('');

  const listeCasFiltree = useMemo(
    () =>
      buildingList.filter((cas) => {
        if (!recherche.trim()) return true;

        const r = normalize(recherche);
        return (
          normalize(cas.title).indexOf(r) >= 0 ||
          (cas.description && normalize(cas.description).indexOf(r) >= 0)
        );
      }),
    [buildingList, recherche],
  );

  return (
    <>
      <div className="fr-container--fluid fr-mb-4v">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-lg-4">
            <Input
              nativeInputProps={{
                'aria-label': 'Rechercher une construction',
                placeholder: 'Rechercher une construction',
                value: recherche,
                onChange: (e) => setRecherche(e.target.value),
              }}
              label={null}
            />
          </div>
        </div>
      </div>
      <div className="fr-container--fluid">
        <div className="fr-grid-row fr-grid-row--gutters">
          {listeCasFiltree.map((cas) => (
            <div
              className="fr-col-12 fr-col-lg-3"
              key={cas.id}
              data-testid="building"
            >
              <Card
                className="definition-card"
                background
                border
                badge={
                  <span>
                    <Badge severity={cas.isBuilding ? 'success' : 'error'}>
                      {cas.isBuilding
                        ? 'Est un bâtiment'
                        : "N'est pas un bâtiment"}
                    </Badge>
                    {cas.distinctionBetweenSingleAndMultipleText && (
                      <Badge
                        className={styles.badgeWithoutContent}
                        severity="warning"
                      >
                        <span></span>
                      </Badge>
                    )}
                  </span>
                }
                desc={
                  cas.description && (
                    <span
                      dangerouslySetInnerHTML={{ __html: cas.description }}
                    />
                  )
                }
                horizontal={false}
                imageAlt={cas.title}
                imageUrl={`/images/definition/${cas.image}`}
                size="small"
                title={cas.title}
                titleAs="h3"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
