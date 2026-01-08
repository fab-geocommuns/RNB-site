import { useEffect, useState } from 'react';

export interface FeveData {
  department_code: string;
  department_name: string;
  found_datetime: string | null;
  found_by_username: string | null;
}

// const DEPARTMENTS: FeveData[] = [
//   {
//     dpt_code: '01',
//     dpt_name: 'Ain',
//     feve_found_at: '2024-01-02T10:00:00Z',
//     feve_found_by: 'Pierre',
//   },
//   {
//     dpt_code: '03',
//     dpt_name: 'Allier',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '07',
//     dpt_name: 'Ardèche',
//     feve_found_at: '2024-01-03T14:30:00Z',
//     feve_found_by: 'Marie',
//   },
//   {
//     dpt_code: '15',
//     dpt_name: 'Cantal',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '26',
//     dpt_name: 'Drôme',
//     feve_found_at: '2024-01-01T09:15:00Z',
//     feve_found_by: 'Luc',
//   },
//   {
//     dpt_code: '38',
//     dpt_name: 'Isère',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '42',
//     dpt_name: 'Loire',
//     feve_found_at: '2024-01-04T16:45:00Z',
//     feve_found_by: 'Sophie',
//   },
//   {
//     dpt_code: '43',
//     dpt_name: 'Haute-Loire',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '63',
//     dpt_name: 'Puy-de-Dôme',
//     feve_found_at: '2024-01-05T11:20:00Z',
//     feve_found_by: 'Thomas',
//   },
//   {
//     dpt_code: '69',
//     dpt_name: 'Rhône',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '73',
//     dpt_name: 'Savoie',
//     feve_found_at: '2024-01-02T13:10:00Z',
//     feve_found_by: 'Julie',
//   },
//   {
//     dpt_code: '74',
//     dpt_name: 'Haute-Savoie',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '21',
//     dpt_name: "Côte-d'Or",
//     feve_found_at: '2024-01-03T08:50:00Z',
//     feve_found_by: 'Antoine',
//   },
//   {
//     dpt_code: '25',
//     dpt_name: 'Doubs',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '39',
//     dpt_name: 'Jura',
//     feve_found_at: '2024-01-01T15:40:00Z',
//     feve_found_by: 'Claire',
//   },
//   {
//     dpt_code: '58',
//     dpt_name: 'Nièvre',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '70',
//     dpt_name: 'Haute-Saône',
//     feve_found_at: '2024-01-04T10:05:00Z',
//     feve_found_by: 'Nicolas',
//   },
//   {
//     dpt_code: '71',
//     dpt_name: 'Saône-et-Loire',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '89',
//     dpt_name: 'Yonne',
//     feve_found_at: '2024-01-05T14:55:00Z',
//     feve_found_by: 'Emilie',
//   },
//   {
//     dpt_code: '90',
//     dpt_name: 'Territoire de Belfort',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '22',
//     dpt_name: "Côtes-d'Armor",
//     feve_found_at: '2024-01-02T09:30:00Z',
//     feve_found_by: 'François',
//   },
//   {
//     dpt_code: '29',
//     dpt_name: 'Finistère',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '35',
//     dpt_name: 'Ille-et-Vilaine',
//     feve_found_at: '2024-01-03T16:20:00Z',
//     feve_found_by: 'Hélène',
//   },
//   {
//     dpt_code: '56',
//     dpt_name: 'Morbihan',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '18',
//     dpt_name: 'Cher',
//     feve_found_at: '2024-01-01T11:45:00Z',
//     feve_found_by: 'Paul',
//   },
//   {
//     dpt_code: '28',
//     dpt_name: 'Eure-et-Loir',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '36',
//     dpt_name: 'Indre',
//     feve_found_at: '2024-01-04T13:35:00Z',
//     feve_found_by: 'Alice',
//   },
//   {
//     dpt_code: '37',
//     dpt_name: 'Indre-et-Loire',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '41',
//     dpt_name: 'Loir-et-Cher',
//     feve_found_at: '2024-01-05T09:25:00Z',
//     feve_found_by: 'Mathieu',
//   },
//   {
//     dpt_code: '45',
//     dpt_name: 'Loiret',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '2A',
//     dpt_name: 'Corse-du-Sud',
//     feve_found_at: '2024-01-02T15:15:00Z',
//     feve_found_by: 'Léa',
//   },
//   {
//     dpt_code: '2B',
//     dpt_name: 'Haute-Corse',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '08',
//     dpt_name: 'Ardennes',
//     feve_found_at: '2024-01-03T10:40:00Z',
//     feve_found_by: 'Guillaume',
//   },
//   {
//     dpt_code: '10',
//     dpt_name: 'Aube',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '51',
//     dpt_name: 'Marne',
//     feve_found_at: '2024-01-01T14:05:00Z',
//     feve_found_by: 'Charlotte',
//   },
//   {
//     dpt_code: '52',
//     dpt_name: 'Haute-Marne',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '54',
//     dpt_name: 'Meurthe-et-Moselle',
//     feve_found_at: '2024-01-04T11:50:00Z',
//     feve_found_by: 'David',
//   },
//   {
//     dpt_code: '55',
//     dpt_name: 'Meuse',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '57',
//     dpt_name: 'Moselle',
//     feve_found_at: '2024-01-05T16:30:00Z',
//     feve_found_by: 'Sarah',
//   },
//   {
//     dpt_code: '67',
//     dpt_name: 'Bas-Rhin',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '68',
//     dpt_name: 'Haut-Rhin',
//     feve_found_at: '2024-01-02T12:00:00Z',
//     feve_found_by: 'Julien',
//   },
//   {
//     dpt_code: '88',
//     dpt_name: 'Vosges',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '02',
//     dpt_name: 'Aisne',
//     feve_found_at: '2024-01-03T09:10:00Z',
//     feve_found_by: 'Manon',
//   },
//   {
//     dpt_code: '59',
//     dpt_name: 'Nord',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '60',
//     dpt_name: 'Oise',
//     feve_found_at: '2024-01-01T15:55:00Z',
//     feve_found_by: 'Alexandre',
//   },
//   {
//     dpt_code: '62',
//     dpt_name: 'Pas-de-Calais',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '80',
//     dpt_name: 'Somme',
//     feve_found_at: '2024-01-04T14:25:00Z',
//     feve_found_by: 'Camille',
//   },
//   {
//     dpt_code: '75',
//     dpt_name: 'Paris',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '77',
//     dpt_name: 'Seine-et-Marne',
//     feve_found_at: '2024-01-05T10:15:00Z',
//     feve_found_by: 'Maxime',
//   },
//   {
//     dpt_code: '78',
//     dpt_name: 'Yvelines',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '91',
//     dpt_name: 'Essonne',
//     feve_found_at: '2024-01-02T13:45:00Z',
//     feve_found_by: 'Elodie',
//   },
//   {
//     dpt_code: '92',
//     dpt_name: 'Hauts-de-Seine',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '93',
//     dpt_name: 'Seine-Saint-Denis',
//     feve_found_at: '2024-01-03T11:30:00Z',
//     feve_found_by: 'Kevin',
//   },
//   {
//     dpt_code: '94',
//     dpt_name: 'Val-de-Marne',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '95',
//     dpt_name: "Val-d'Oise",
//     feve_found_at: '2024-01-01T16:10:00Z',
//     feve_found_by: 'Laura',
//   },
//   {
//     dpt_code: '14',
//     dpt_name: 'Calvados',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '27',
//     dpt_name: 'Eure',
//     feve_found_at: '2024-01-04T12:30:00Z',
//     feve_found_by: 'Romain',
//   },
//   {
//     dpt_code: '50',
//     dpt_name: 'Manche',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '61',
//     dpt_name: 'Orne',
//     feve_found_at: '2024-01-05T09:40:00Z',
//     feve_found_by: 'Céline',
//   },
//   {
//     dpt_code: '76',
//     dpt_name: 'Seine-Maritime',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '16',
//     dpt_name: 'Charente',
//     feve_found_at: '2024-01-02T14:50:00Z',
//     feve_found_by: 'Benoît',
//   },
//   {
//     dpt_code: '17',
//     dpt_name: 'Charente-Maritime',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '19',
//     dpt_name: 'Corrèze',
//     feve_found_at: '2024-01-03T10:25:00Z',
//     feve_found_by: 'Audrey',
//   },
//   {
//     dpt_code: '23',
//     dpt_name: 'Creuse',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '24',
//     dpt_name: 'Dordogne',
//     feve_found_at: '2024-01-01T11:15:00Z',
//     feve_found_by: 'Jérôme',
//   },
//   {
//     dpt_code: '33',
//     dpt_name: 'Gironde',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '40',
//     dpt_name: 'Landes',
//     feve_found_at: '2024-01-04T15:35:00Z',
//     feve_found_by: 'Sandrine',
//   },
//   {
//     dpt_code: '47',
//     dpt_name: 'Lot-et-Garonne',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '64',
//     dpt_name: 'Pyrénées-Atlantiques',
//     feve_found_at: '2024-01-05T13:05:00Z',
//     feve_found_by: 'Laurent',
//   },
//   {
//     dpt_code: '79',
//     dpt_name: 'Deux-Sèvres',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '86',
//     dpt_name: 'Vienne',
//     feve_found_at: '2024-01-02T10:55:00Z',
//     feve_found_by: 'Aurélie',
//   },
//   {
//     dpt_code: '87',
//     dpt_name: 'Haute-Vienne',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '09',
//     dpt_name: 'Ariège',
//     feve_found_at: '2024-01-03T14:15:00Z',
//     feve_found_by: 'Christophe',
//   },
//   {
//     dpt_code: '11',
//     dpt_name: 'Aude',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '12',
//     dpt_name: 'Aveyron',
//     feve_found_at: '2024-01-01T09:50:00Z',
//     feve_found_by: 'Stéphanie',
//   },
//   {
//     dpt_code: '30',
//     dpt_name: 'Gard',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '31',
//     dpt_name: 'Haute-Garonne',
//     feve_found_at: '2024-01-04T16:00:00Z',
//     feve_found_by: 'Vincent',
//   },
//   {
//     dpt_code: '32',
//     dpt_name: 'Gers',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '34',
//     dpt_name: 'Hérault',
//     feve_found_at: '2024-01-05T11:40:00Z',
//     feve_found_by: 'Karine',
//   },
//   { dpt_code: '46', dpt_name: 'Lot', feve_found_at: null, feve_found_by: null },
//   {
//     dpt_code: '48',
//     dpt_name: 'Lozère',
//     feve_found_at: '2024-01-02T15:25:00Z',
//     feve_found_by: 'Sébastien',
//   },
//   {
//     dpt_code: '65',
//     dpt_name: 'Hautes-Pyrénées',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '66',
//     dpt_name: 'Pyrénées-Orientales',
//     feve_found_at: '2024-01-03T12:45:00Z',
//     feve_found_by: 'Nathalie',
//   },
//   {
//     dpt_code: '81',
//     dpt_name: 'Tarn',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '82',
//     dpt_name: 'Tarn-et-Garonne',
//     feve_found_at: '2024-01-01T10:30:00Z',
//     feve_found_by: 'Florian',
//   },
//   {
//     dpt_code: '44',
//     dpt_name: 'Loire-Atlantique',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '49',
//     dpt_name: 'Maine-et-Loire',
//     feve_found_at: '2024-01-04T13:55:00Z',
//     feve_found_by: 'Virginie',
//   },
//   {
//     dpt_code: '53',
//     dpt_name: 'Mayenne',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '72',
//     dpt_name: 'Sarthe',
//     feve_found_at: '2024-01-05T09:50:00Z',
//     feve_found_by: 'Mickaël',
//   },
//   {
//     dpt_code: '85',
//     dpt_name: 'Vendée',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '04',
//     dpt_name: 'Alpes-de-Haute-Provence',
//     feve_found_at: '2024-01-02T14:00:00Z',
//     feve_found_by: 'Laetitia',
//   },
//   {
//     dpt_code: '05',
//     dpt_name: 'Hautes-Alpes',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '06',
//     dpt_name: 'Alpes-Maritimes',
//     feve_found_at: '2024-01-03T11:10:00Z',
//     feve_found_by: 'Arnaud',
//   },
//   {
//     dpt_code: '13',
//     dpt_name: 'Bouches-du-Rhône',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '83',
//     dpt_name: 'Var',
//     feve_found_at: '2024-01-01T15:05:00Z',
//     feve_found_by: 'Caroline',
//   },
//   {
//     dpt_code: '84',
//     dpt_name: 'Vaucluse',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '971',
//     dpt_name: 'Guadeloupe',
//     feve_found_at: '2024-01-04T12:15:00Z',
//     feve_found_by: 'Thibault',
//   },
//   {
//     dpt_code: '972',
//     dpt_name: 'Martinique',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '973',
//     dpt_name: 'Guyane',
//     feve_found_at: '2024-01-05T16:40:00Z',
//     feve_found_by: 'Mélanie',
//   },
//   {
//     dpt_code: '974',
//     dpt_name: 'La Réunion',
//     feve_found_at: null,
//     feve_found_by: null,
//   },
//   {
//     dpt_code: '976',
//     dpt_name: 'Mayotte',
//     feve_found_at: '2024-01-02T10:45:00Z',
//     feve_found_by: 'Jonathan',
//   },
// ];

export const useFeveData = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = new URL(process.env.NEXT_PUBLIC_API_BASE + `/feves/`);

        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        const sortedData = data.sort((a: FeveData, b: FeveData) =>
          a.department_name.localeCompare(b.department_name),
        );

        setData(sortedData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return {
    data,
    loading,
  };
};
