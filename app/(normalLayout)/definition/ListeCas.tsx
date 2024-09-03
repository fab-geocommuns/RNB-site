'use client';

import { Card } from '@codegouvfr/react-dsfr/Card';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { useMemo, useState } from 'react';
import styles from '@/styles/definition.module.scss';
import { Cas } from '@/app/(normalLayout)/definition/ListeCas.type';

const normalize = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

type ListeCasProps = {
  listeCas: Cas[];
};

export default function ListeCas({ listeCas }: ListeCasProps) {
  const [recherche, setRecherche] = useState('');

  const listeCasFiltree = useMemo(
    () =>
      listeCas.filter((cas) => {
        if (!recherche.trim()) return true;

        const r = normalize(recherche);
        return (
          normalize(cas.titre).indexOf(r) >= 0 ||
          (cas.description && normalize(cas.description).indexOf(r) >= 0)
        );
      }),
    [listeCas, recherche],
  );

  return (
    <>
      <div className="fr-container--fluid fr-mb-4v">
        <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--center">
          <div className="fr-col-12 fr-col-lg-6">
            <Input
              nativeInputProps={{
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
            <div className="fr-col-12 fr-col-lg-3" key={cas.id}>
              <Card
                background
                border
                badge={
                  <span>
                    <Badge severity={cas.estBatiment ? 'success' : 'error'}>
                      {cas.estBatiment
                        ? 'Est un bâtiment'
                        : "N'est pas un bâtiment"}
                    </Badge>
                    {cas.texteDistinction && (
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
                imageAlt={cas.titre}
                imageUrl={`/images/definition/${cas.image}`}
                size="small"
                title={cas.titre}
                titleAs="h3"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
