import { useEffect, useMemo, useState } from 'react';
import { rnbApi } from '@/utils/rnbApi';

export interface FeveData {
  department_code: string;
  department_name: string;
  found_datetime: string | null;
  found_by_username: string | null;
}

export const useFeveData = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>();

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await rnbApi.get<FeveData[]>('/feves/', {
          cache: 'no-cache',
        });

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

export const useUserFeves = (username: string | undefined) => {
  const { data, loading } = useFeveData();

  const userFeves = useMemo(() => {
    if (!data || !username) return [];
    return data
      .filter((feve: FeveData) => feve.found_by_username === username)
      .sort(
        (a: FeveData, b: FeveData) =>
          new Date(b.found_datetime!).getTime() -
          new Date(a.found_datetime!).getTime(),
      );
  }, [data, username]);

  return { data: userFeves, loading };
};
