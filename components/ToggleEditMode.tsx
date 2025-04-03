import { ToggleSwitch } from '@codegouvfr/react-dsfr/ToggleSwitch';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function ToogleEditMode() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // const [editModeEnabled, setEditModeEnabled] = useState(false);
  const editModeEnabled = pathname === '/edition';
  const toggleView = () => {
    if (editModeEnabled) {
      router.push(`/carte?${searchParams.toString()}`);
    } else {
      router.push(`/edition?${searchParams.toString()}`);
    }
  };

  return (
    <ToggleSwitch
      checked={editModeEnabled}
      className=""
      label={<span className="fr-btn">Mode édition</span>}
      labelPosition="left"
      onChange={toggleView}
    />
  );
}
