'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import DBCard from './DBCard';
import { DiffusionDatabase, Attribute } from './diffusionDatabase.type';
import SearchBar from '@codegouvfr/react-dsfr/SearchBar';

import styles from '@/styles/searchBlock.module.scss';
import { fuzzySearchAttributes } from './util/fuzzySearchAttributes';
import va, { track } from '@vercel/analytics';
import debounce from 'lodash.debounce';
import useQueryParamState from '@/utils/useQueryParamState';
interface Props {
  databases: DiffusionDatabase[];
}

const AttributesSearchBar = ({
  onDebouncedChange,
  initialValue,
}: {
  onDebouncedChange: (value: string) => void;
  initialValue?: string;
}) => {
  const [value, setValue] = useState(initialValue || '');

  const debouncedHandler = useCallback(debounce(onDebouncedChange, 500), [
    onDebouncedChange,
  ]);

  const handleValueChange = (value: string) => {
    setValue(value);
    debouncedHandler(value);
  };

  return (
    <SearchBar
      className={styles.searchBar}
      label="Par exemple : année de construction, hauteur, accessibilité etc."
      renderInput={({ className, id, placeholder, type }) => (
        <input
          className={className}
          id={id}
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(event) => handleValueChange(event.currentTarget.value)}
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

const trackSearch = (search: string) => {
  if (search.length < 3) return;
  va.track('db-search', {
    search: search,
  });
};

const debouncedTrackSearch = debounce(trackSearch, 2000);

export default function SearchableDatabaseSection({ databases }: Props) {
  const [search, setSearch] = useQueryParamState('search', '');

  const databaseCount = databases.length;
  const attributeCount = databases.reduce(
    (acc, db) => acc + db.attributes.length,
    0,
  );

  useEffect(() => {
    debouncedTrackSearch(search);
  }, [search]);

  const databasesMatchingQuery = fuzzySearchAttributes(databases, search, {
    max: 20,
  });

  const searchActive = search.length >= 3;
  const anySearchResults = databasesMatchingQuery.length > 0;

  const displayedDatabases =
    searchActive && anySearchResults ? databasesMatchingQuery : databases;

  return (
    <>
      <h2 id="liste" className="section__title">
        Les bases contenant des identifiants RNB
      </h2>
      <div className={styles.searchBlock} id="search-block">
        <p className="section__subtitle">
          Recherchez parmi {attributeCount} attributs accessibles dans{' '}
          {databaseCount} bases répertoriées
        </p>
        <AttributesSearchBar
          onDebouncedChange={setSearch}
          initialValue={search}
        />
      </div>
      <div>
        {searchActive && !anySearchResults && <EmptyState />}
        {displayedDatabases.map((database) => (
          <DBCard
            key={database.id}
            db={database}
            displayAttributes={
              searchActive && anySearchResults && database.attributes.length > 0
            }
            attributes={database.attributes}
          />
        ))}
      </div>
    </>
  );
}
