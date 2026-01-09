export function getArrayQueryParam<T>(
  key: string,
  process: (value: string) => T,
  filter: (value: T) => boolean,
): T[] | null {
  if (typeof window === 'undefined') return null;
  const searchParams = new URLSearchParams(window.location.search);
  const values = searchParams.getAll(key);
  const result = values.map(process).filter(filter);
  if (result.length === 0) return null;
  return result;
}

export function setArrayQueryParam<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;

  searchParams.delete(key);

  value.forEach((v) => {
    searchParams.append(key, v as unknown as string);
  });

  window.history.replaceState({}, '', url.toString());
}
