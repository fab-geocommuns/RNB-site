import { PublicUser } from '@/stores/map/map-slice';

type BuildingResponseOverrides = {
  rnb_id?: string;
  status?: string;
  is_active?: boolean;
  validated_by?: PublicUser[];
  addresses?: any[];
};

/**
 * Réponse JSON d'un GET /buildings/{id}/ suffisamment complète pour rendre
 * le panneau d'édition. La clé est `validated_by` (nom à jour de l'API).
 */
export function makeBuildingResponse(
  overrides: BuildingResponseOverrides = {},
) {
  return {
    rnb_id: 'PG46YY6YWCX8',
    status: 'constructed',
    is_active: true,
    point: { type: 'Point', coordinates: [2.424, 48.8452] },
    shape: {
      type: 'Polygon',
      coordinates: [
        [
          [2.423721634213109, 48.84523835886833],
          [2.4237562502758863, 48.84539782325717],
          [2.4242824144108397, 48.84534770593274],
          [2.4242477983494553, 48.84518368524684],
          [2.423721634213109, 48.84523835886833],
        ],
      ],
    },
    addresses: [],
    validated_by: [],
    ext_ids: [],
    plots: [],
    ...overrides,
  };
}

/** Un validateur fictif (utilisé pour les listes validated_by). */
export function makeValidator(over: Partial<PublicUser> = {}): PublicUser {
  return {
    id: 1,
    display_name: 'Camille Témoin',
    username: 'ctemoin',
    organization_name: 'Organisation Test',
    ...over,
  };
}
