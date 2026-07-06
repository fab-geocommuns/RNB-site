import { useEffect, useState } from 'react';
import type { MedalColor } from '@/components/games/summerGames/Medal';

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

export interface TrophyDetails {
  description: string;
  currentLevel: LevelData | undefined;
  nextLevel: LevelData | undefined;
  count: string | null | undefined;
}

export const getTrophiesData = () => {
  const [loadingTrophies, setLoading] = useState(true);
  const [data, setData] = useState<TrophyData[]>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = new URL(process.env.NEXT_PUBLIC_API_BASE + `/trophies/`);

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
        const url = new URL(
          process.env.NEXT_PUBLIC_API_BASE + `/user/${username}/trophies/`,
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

export const getUserTrophyData = (
  trophies: TrophyData[],
  userTrophy: TrophyUserData,
): TrophyDetails => {
  const trophyInfos = trophies?.find(
    (t) => t.trophy_label === userTrophy.trophy_label,
  );

  const currentLevelIndex = trophyInfos?.levels.findIndex(
    (l) => l.level === userTrophy.level,
  );

  const currentLevel =
    currentLevelIndex !== undefined && currentLevelIndex >= 0
      ? trophyInfos?.levels[currentLevelIndex]
      : undefined;

  const nextLevel =
    currentLevelIndex !== undefined &&
    currentLevelIndex >= 0 &&
    trophyInfos?.levels[currentLevelIndex + 1]
      ? trophyInfos.levels[currentLevelIndex + 1]
      : undefined;

  const count =
    currentLevelIndex !== undefined && currentLevelIndex >= 0
      ? trophyInfos?.levels[currentLevelIndex].count
      : undefined;

  return {
    description: trophyInfos?.description || '',
    currentLevel,
    nextLevel,
    count,
  };
};

export const getUserTrophieDetails = (trophy: TrophyData): TrophyDetails => {
  const firstLevel = trophy.levels[0];
  const description = trophy.description;
  const currentLevel = firstLevel;
  const nextLevel = undefined;
  const count = firstLevel.count;

  return {
    description: description || '',
    currentLevel,
    nextLevel,
    count,
  };
};

export const getTrophiesToWin = (
  trophies: TrophyData[] | undefined,
  userTrophies: TrophyUserData[] | undefined,
): TrophyData[] => {
  const safeTrophies = Array.isArray(trophies) ? trophies : [];
  const safeUserTrophies = Array.isArray(userTrophies) ? userTrophies : [];

  const wonTrophyIds = new Set(
    safeUserTrophies.map((userTrophy) => userTrophy.trophy),
  );

  return safeTrophies.filter((trophy) => !wonTrophyIds.has(trophy.trophy));
};

export function trophyImageUrl(trophy: TrophyUserData | TrophyData): string {
  return `/images/trophies/${trophy.trophy}.png`;
}

export function trophyMedalColor(level: number): MedalColor {
  if (level <= 1) return 'bronze';
  if (level === 2) return 'silver';
  return 'gold';
}
