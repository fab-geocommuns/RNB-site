import { useEffect, useState } from 'react';

export interface TrophyUserData {
  trophy: string;
  trophy_label: string;
  level: string;
  level_label: string | null;
}

export interface TrophyData {
  trophy: string;
  trophy_label: string;
  description: string | null;
  count: string | null;
  levels: LevelData[];
}

export interface LevelData {
  level: string;
  level_label: string;
  condition: string | null;
  count: string | null;
}

export const getTrophiesData = () => {
  const [loadingTrophies, setLoading] = useState(true);
  const [data, setData] = useState<TrophyData[]>();

  useEffect(() => {
    const getData = async () => {
      try {
        // faire appel à la bonne variable de process.env
        const url = new URL(
          `https://staging.rnb-api.beta.gouv.fr/api/alpha/trophies/`,
        );

        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        const jsonData = await response.json();

        setData(jsonData);
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
    loadingTrophies,
  };
};

export const getUserTrophiesData = (username: string | undefined) => {
  const [loadingUserTrophies, setLoading] = useState(true);
  const [data, setData] = useState<TrophyUserData[]>();

  useEffect(() => {
    const getData = async () => {
      try {
        // faire appel à la bonne variable de process.env
        const url = new URL(
          `https://staging.rnb-api.beta.gouv.fr/api/alpha/user/` +
            username +
            `/trophies/`,
        );

        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        const jsonData = await response.json();

        setData(jsonData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [username]);

  return {
    data,
    loadingUserTrophies,
  };
};
