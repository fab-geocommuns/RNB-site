'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@codegouvfr/react-dsfr/SearchBar';
import styles from '@/styles/home.module.scss';
import { DiffusionDatabase } from './diffusionDatabase.type';
import ImageNext from 'next/image';
import Link from 'next/link';

function FeaturedDatabases({ dbs }: { dbs: DiffusionDatabase[] }) {
  return (
    <div className={styles.featuredDatabases}>
      {dbs.map((db) => (
        <div
          className={styles.featuredDatabases__item}
          title={db.featured_summary || ''}
          key={db.id}
        >
          <ImageNext
            src={db.image_url || ''}
            alt={db.name}
            width="52"
            height="52"
            className={styles.featuredDatabases__item__logo}
            placeholder="empty"
          />
        </div>
      ))}
    </div>
  );
}

export default function DatabaseSearchForm({
  dbs,
}: {
  dbs: DiffusionDatabase[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const databaseCount = dbs.length;
  const attributeCount = dbs.reduce((acc, db) => acc + db.attributes.length, 0);
  const featuredDatabases = dbs.filter((db) => db.is_featured);

  const handleSubmit = (text: string) => {
    const search = text.trim();
    if (search !== '') {
      router.push(
        `/outils-services/rapprochement?search=${encodeURIComponent(search)}`,
      );
    }
  };

  return (
    <>
      <div>
        <b>
          Recherchez parmi {attributeCount} attributs accessibles dans{' '}
          {databaseCount} bases répertoriées
        </b>
      </div>
      <SearchBar
        label="Rechercher"
        className={styles.searchBar}
        big
        onButtonClick={handleSubmit}
        renderInput={({ className, id, type }) => (
          <input
            className={className}
            placeholder="Rechercher parmi les attributs répertoriés"
            id={id}
            type={type}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        )}
      />
      <FeaturedDatabases dbs={featuredDatabases} />
      <Link href="/outils-services/rapprochement">
        Voir l&apos;ensemble des bases contenant des ID-RNB
      </Link>
    </>
  );
}
