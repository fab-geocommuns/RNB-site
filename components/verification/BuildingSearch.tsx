'use client';

import { useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import AddressInput from '@/components/address/AddressInput';
import { AddressSuggestion } from '@/components/address/AddressAutocomplete';
import { queryIsRnbId } from '@/components/address/utils';
import { rnbApi } from '@/utils/rnbApi';

type FoundBuilding = {
  rnb_id: string;
  status: string;
  distance?: number;
  addresses: { street_number?: string | null; street?: string | null }[];
};

type Paginated<T> = { results: T[] };

// Rayon de repli quand l'adresse n'est rattachée à aucun bâtiment.
const CLOSEST_RADIUS_M = 40;

export function normalizeRnbId(query: string): string {
  return query.replace(/[\s-]/g, '').toUpperCase();
}

// Recherche d'un bâtiment par identifiant RNB (Entrée) ou par adresse
// (autocomplétion BAN). Une adresse donne les bâtiments qui y sont rattachés,
// sinon les plus proches du point de l'adresse.
export default function BuildingSearch({
  onSelect,
}: {
  onSelect: (rnbId: string) => void;
}) {
  const [results, setResults] = useState<FoundBuilding[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const select = (rnbId: string) => {
    setResults(null);
    setMessage(null);
    onSelect(rnbId);
  };

  const onEnter = (value: string) => {
    if (queryIsRnbId(value.trim())) select(normalizeRnbId(value.trim()));
  };

  const onAddress = async (suggestion: AddressSuggestion) => {
    const [lon, lat] = suggestion.geometry.coordinates;
    setLoading(true);
    setResults(null);
    setMessage(null);
    try {
      let found: FoundBuilding[] = [];
      if (suggestion.properties.type === 'housenumber') {
        found = (
          await rnbApi.get<Paginated<FoundBuilding>>('buildings/address/', {
            query: { cle_interop_ban: suggestion.properties.id },
          })
        ).results;
      }
      if (found.length === 0) {
        found = (
          await rnbApi.get<Paginated<FoundBuilding>>('buildings/closest/', {
            query: { point: `${lat},${lon}`, radius: CLOSEST_RADIUS_M },
          })
        ).results;
        if (found.length > 0) {
          setMessage(
            `Aucun bâtiment rattaché à cette adresse : bâtiments à moins de ${CLOSEST_RADIUS_M} m.`,
          );
        }
      }
      if (found.length === 1 && !found[0].distance) {
        select(found[0].rnb_id);
      } else if (found.length === 0) {
        setMessage('Aucun bâtiment trouvé à cette adresse.');
      } else {
        setResults(found);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Recherche impossible.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fr-input-group fr-mb-2v">
      <label className="fr-label" htmlFor="verification-search">
        Chercher un bâtiment
        <span className="fr-hint-text">
          Identifiant RNB puis Entrée, ou adresse
        </span>
      </label>
      <AddressInput
        onSuggestionSelected={onAddress}
        onEnterPress={onEnter}
        render={(inputProps) => (
          <input
            {...inputProps}
            id="verification-search"
            className="fr-input"
            placeholder="ex. NDTB6FJZ8G13 ou 2 rue Jean Jaurès Pinsaguel"
          />
        )}
      />
      {loading && <p className="fr-text--sm fr-mt-1v">Recherche…</p>}
      {message && (
        <Alert
          className="fr-mt-1v"
          severity={results ? 'info' : 'warning'}
          small
          description={message}
        />
      )}
      {results && (
        <ul
          className="fr-mt-1v fr-mb-0"
          style={{
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: fr.spacing('1v'),
          }}
        >
          {results.map((b) => (
            <li key={b.rnb_id}>
              <Button
                size="small"
                priority="tertiary"
                onClick={() => select(b.rnb_id)}
              >
                {b.rnb_id} · {b.status}
                {b.distance ? ` · ${Math.round(b.distance)} m` : ''}
                {b.addresses[0]
                  ? ` · ${[b.addresses[0].street_number, b.addresses[0].street]
                      .filter(Boolean)
                      .join(' ')}`
                  : ''}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
