'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DBCard from './DBCard';
import { DiffusionDatabase, Attribute } from './diffusionDatabase.type';
import SearchBar from '@codegouvfr/react-dsfr/SearchBar';

import styles from '@/styles/searchBlock.module.scss';

import va from '@vercel/analytics';

interface Props {
  databases: DiffusionDatabase[];
}

const AttributesSearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <SearchBar
      className={styles.searchBar}
      label="Rechercher parmi les attributs répertoriés"
      renderInput={({ className, id, placeholder, type }) => (
        <input
          className={className}
          id={id}
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      )}
    />
  );
};

const EmptyState = () => {
  return (
    <div>
      Aucun attribut correspondant à cette description n’a été trouvé dans les
      bases dans lesquelles les ID-RNB sont diffusés.
      <br />
      Voici d’autres bases qui pourraient contenir les données qui vous
      intéressent :
    </div>
  );
};

export default function SearchableDatabaseSection({ databases }: Props) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const databaseCount = databases.length;
  const attributeCount = databases.reduce(
    (acc, db) => acc + db.attributes.length,
    0,
  );

  const trackSearch = (search: string) => {
    return () => {
      va.track('db-search', {
        search: search,
      });
    };
  };

  // Wait 2 seconds for the search to not change before tracking
  // Track only searches with more than 3 characters
  useEffect(() => {
    if (search.length > 3) {
      const timeout = setTimeout(trackSearch(search), 2000);
      return () => clearTimeout(timeout);
    }
  }, [search]);

  const relevantAttributesPerDatabase: { [key: number]: Attribute[] } = {};

  const databasesMatchingQuery = databases.filter((database) => {
    if (search.length == 0) return true;

    relevantAttributesPerDatabase[database.id] = database.attributes.filter(
      (attribute) =>
        attribute.description.toLowerCase().includes(search.toLowerCase()),
    );
    return relevantAttributesPerDatabase[database.id].length > 0;
  });

  const displayedDatabases =
    databasesMatchingQuery.length > 0 ? databasesMatchingQuery : databases;

  return (
    <>
      <div className={styles.searchBlock}>
        <h2 className="section__subtitle">
          Recherchez parmi {attributeCount} attributs accessibles dans{' '}
          {databaseCount} bases répertoriées
        </h2>
        <AttributesSearchBar value={search} onChange={setSearch} />
      </div>
      <div>
        {databasesMatchingQuery.length === 0 && <EmptyState />}
        {displayedDatabases.map((database) => (
          <DBCard
            key={database.id}
            db={database}
            displayAttributes={
              search.length > 0 &&
              relevantAttributesPerDatabase[database.id]?.length > 0
            }
            attributes={relevantAttributesPerDatabase[database.id] || []}
          />
        ))}
      </div>
    </>
  );
}
