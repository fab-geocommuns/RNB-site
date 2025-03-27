export async function getOrganizationNames(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_API_BASE + '/organization_names';
  const res = await fetch(url);
  const data = await res.json();
  return data.sort();
}
