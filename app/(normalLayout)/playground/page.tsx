import { getOrganizationNames } from '@/utils/organizations';
import Autocomplete from './Autocomplete';

export default async function Playground() {
  const organizationNames = await getOrganizationNames();
  return (
    <div className="fr-container">
      <h1>Playground</h1>
      <div>
        <Autocomplete options={organizationNames} label="Organization Name" />
      </div>
    </div>
  );
}
