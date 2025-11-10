export const mockFetchReportById = async (reportId: string) => {
  console.log('Fetching report with ID:', reportId);

  const geojson = mockReportsGeojson();
  const feature = geojson.features.find((feature) => feature.id === reportId);

  if (feature) {
    return feature;
  } else {
    return null;
  }
};

export const mockReportsGeojson = (): GeoJSON.FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 1,
        properties: {
          status: 'pending',
          created_at: '2024-03-01T10:00:00Z',
          status_updated_at: null,
          tags: ['authorized_construction'],
          origin: {
            author: {
              type: 'script',
              id: 'sitadel_importer',
            },
            source: {
              dataset: 'sitadel',
              dataset_item: 'PC0987654',
            },
          },
          messages: [
            {
              author: {
                name: 'Equipe RNB',
                id: 'sitadel_importer',
                type: 'script',
              },
              created_at: '2024-03-01T10:00:00Z',
              text: 'Le permis de constuire PC0987654, instruit le 12/12/2023 prévoit la construction de 5 logements. Y a-t-il une nouvelle construction ?',
            },
            {
              author: {
                type: 'user',
                id: 'user',
                name: 'Jeanne Dupont',
              },
              created_at: '2024-03-02T14:30:00Z',
              text: "Je vienns de vérifier sur le terrain, il n'y a pas de nouvelle construction à cet endroit.",
            },
            {
              author: {
                type: 'user',
                id: 'user',
                name: 'Jeanne Dupont',
              },
              created_at: '2024-05-02T14:32:00Z',
              text: "Ca y est la construction a commencé. Elle n'est pas visible sur la vue aérienne. J'attend avant de dessiner le bâtiment ?",
            },
          ],
        },
        geometry: {
          coordinates: [-0.48767086378143176, 44.755800633147715],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        id: 2,
        properties: {
          status: 'rejected',
          created_at: '2025-01-01T10:00:00Z',
          status_updated_at: '2025-01-02T14:30:00Z',
          tags: ['user_report'],
          origin: {
            author: {
              type: 'anonymous_user',
              id: null,
            },
            source: null,
          },
          messages: [
            {
              author: {
                type: 'anonymous_user',
                id: null,
              },
              created_at: '2025-01-01T10:00:00Z',
              text: 'Bonne année au RNB !!',
            },
            {
              author: {
                type: 'user',
                id: 'user',
                name: 'Audrey',
              },
              created_at: '2025-01-02T14:30:00Z',
              text: "Merci et bonne année également. Je ferme ce signalement et transmets vos voeux à l'équipe.",
            },
          ],
        },
        geometry: {
          coordinates: [-0.4893048393990398, 44.75522047567463],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        id: 3,
        properties: {
          status: 'fixed',
          created_at: '2025-01-01T10:00:00Z',
          status_updated_at: '2025-01-02T14:30:00Z',
          tags: ['arcep_bdg'],
          origin: {
            author: {
              type: 'script',
              id: 'arcep_importer',
            },
            source: {
              dataset: 'arcep',
              dataset_item: 'B1234',
            },
          },
          messages: [
            {
              author: {
                type: 'script',
                id: 'arcep_importer',
                name: 'Equipe RNB',
              },
              created_at: '2025-01-01T10:00:00Z',
              text: "L'ARCEP indique avoir qu'un bâtiment (B1234) est raccordé au réseau fibre ici. Il n'y a pas de bâtiment RNB proche. Y a-t-il un bâtiment à ajouter ?",
            },
            {
              author: {
                type: 'user',
                id: 678,
                name: 'Gaemou',
              },
              created_at: '2025-01-02T14:30:00Z',
              text: 'oui. Bâtiment ajouté.',
            },
          ],
        },
        geometry: {
          coordinates: [-0.4881073915809395, 44.754913331125834],
          type: 'Point',
        },
      },
    ],
  };
};
