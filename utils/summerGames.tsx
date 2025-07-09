import { useEffect, useState } from 'react';

export const useSummerGameUserData = (username: string, updatedAt: number) => {
  const [loading, setLoading] = useState(true);
  const [summerGameUserData, setSummerGameUserData] = useState<any>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = new URL(
          process.env.NEXT_PUBLIC_API_BASE +
            `/editions/ranking/${encodeURIComponent(username)}/`,
        );

        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        setSummerGameUserData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [updatedAt]);

  return {
    summerGameUserData,
    loading,
  };
};

export const useSummerGamesData = (limit: number) => {
  const [loading, setLoading] = useState(true);
  const [summerGamesData, setSummerGamesData] = useState<any>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = new URL(
          process.env.NEXT_PUBLIC_API_BASE + '/editions/ranking/',
        );
        url.searchParams.append('max_rank', limit.toString());

        console.log(url);

        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        const ranks = await response.json();

        let formatted = {
          individual: [],
          department: [],
          city: [],
          shared: {
            goal: ranks.goal,
            absolute: 0,
            percent: 0,
          },
        };

        // individual
        formatted.individual = ranks.individual.map((rank: any) => {
          return {
            name: rank[0],
            count: rank[1],
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
  }, [limit]);

  return {
    summerGamesData,
    loading,
  };
};
