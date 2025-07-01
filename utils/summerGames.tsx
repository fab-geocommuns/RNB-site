import { useEffect, useState } from 'react';

export const useSummerGamesData = () => {
  const [loading, setLoading] = useState(true);
  const [summerGamesData, setSummerGamesData] = useState<any>();

  useEffect(() => {
    const getData = async () => {
      try {
        // const url =
        //   process.env.NEXT_PUBLIC_API_BASE + '/contributions/ranking/';

        // const response = await fetch(url, {
        //   cache: 'no-cache',
        //   headers: { 'Content-Type': 'application/json' },
        // });
        // const ranks = await response.json();

        const ranks = {
          global: 8000, // Example total contributions
          individual: [
            [100, 'Alice'],
            [90, 'Bob'],
            [80, 'Charlie'],
            [70, 'David'],
            [60, 'Eve'],
          ],
          city: [
            ['75', 'Paris', 500],
            ['69', 'Lyon', 300],
            ['33', 'Marseille', 200],
            ['44', 'Toulouse', 150],
            ['59', 'Nice', 100],
          ],
          departement: [
            ['75', 'Paris', 1000],
            ['69', 'Rhône', 800],
            ['33', 'Gironde', 600],
            ['44', 'Haute-Garonne', 400],
            ['59', 'Alpes-Maritimes', 300],
          ],
        };

        let formatted = {
          individual: [],
          department: [],
          city: [],
          shared: {
            goal: 10000,
            absolute: 0,
            percent: 0,
          },
        };

        // individual
        formatted.individual = ranks.individual.map((rank: any) => {
          return {
            name: '#' + rank[1],
            count: rank[0],
          };
        });

        // city
        formatted.city = ranks.city.map((rank: any) => {
          return {
            name: rank[1] + ' (' + rank[0].slice(0, 2) + ')',
            count: rank[2],
          };
        });

        // department
        formatted.department = ranks.departement.map((rank: any) => {
          return {
            name: rank[1] + ' (' + rank[0] + ')',
            count: rank[2],
          };
        });

        // global
        formatted.shared['absolute'] = ranks.global;
        formatted.shared.percent = Math.round(
          (ranks.global / formatted.shared.goal) * 100,
        );

        setSummerGamesData(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return {
    summerGamesData,
    loading,
  };
};
