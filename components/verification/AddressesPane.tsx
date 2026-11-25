'use client';

import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import {
  BuildingAddresses,
  NEARBY_ADDRESSES_RADIUS_M,
} from '@/components/verification/useBuildingAddresses';
import { formatHistoryDate } from '@/utils/verification/history';

const { decisions } = fr.colors.getHex({ isDark: false });
const mention = { color: decisions.text.mention.grey.default };

function banMapUrl([lon, lat]: [number, number]) {
  return `https://adresse.data.gouv.fr/carte-base-adresse-nationale?lng=${lon}&lat=${lat}&zoom=20`;
}

// Adresses liées au bâtiment (certification BAN, sources, distance au
// bâtiment) et adresses BAN proches qui ne lui sont pas liées.
export default function AddressesPane({
  addresses,
}: {
  addresses: BuildingAddresses;
}) {
  const { linked, nearby, loading } = addresses;

  return (
    <div>
      <h3 className="fr-text--sm fr-text--bold fr-mb-1v">
        Adresses liées ({linked.length})
      </h3>
      {linked.length === 0 && (
        <p className="fr-text--sm">Aucune adresse liée à ce bâtiment.</p>
      )}
      <ul
        style={{ listStyle: 'none', padding: 0, margin: 0 }}
        className="fr-mb-3v"
      >
        {linked.map((a) => (
          <li key={a.id} className="fr-mb-2v">
            <div className="fr-text--sm fr-mb-0">
              <strong>{a.label}</strong>{' '}
              {a.missing ? (
                <Badge small noIcon severity="error">
                  Absente de la BAN
                </Badge>
              ) : a.certified === null ? null : a.certified ? (
                <Badge small noIcon severity="success">
                  Certifiée
                </Badge>
              ) : (
                <Badge small noIcon severity="warning">
                  Non certifiée
                </Badge>
              )}
            </div>
            <p className="fr-text--xs fr-mb-0" style={mention}>
              {a.id}
              {a.distance !== null
                ? ` · à ${Math.round(a.distance)} m du bâtiment`
                : ''}
              {a.sources.length ? ` · source ${a.sources.join(', ')}` : ''}
              {a.updatedAt ? ` · MAJ ${formatHistoryDate(a.updatedAt)}` : ''}
              {a.position && (
                <>
                  {' · '}
                  <a
                    className="fr-link fr-link--sm"
                    href={banMapUrl(a.position)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    voir dans la BAN
                  </a>
                </>
              )}
            </p>
          </li>
        ))}
      </ul>

      <h3 className="fr-text--sm fr-text--bold fr-mb-1v">
        Adresses BAN proches non liées (moins de {NEARBY_ADDRESSES_RADIUS_M} m)
      </h3>
      {loading ? (
        <p className="fr-text--sm">Recherche…</p>
      ) : nearby.length === 0 ? (
        <p className="fr-text--sm">Aucune.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {nearby.map((a) => (
            <li key={a.id} className="fr-text--sm fr-mb-1v">
              {a.label}{' '}
              <span style={mention}>· à {Math.round(a.distance)} m</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
