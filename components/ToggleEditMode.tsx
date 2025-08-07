import { ToggleSwitch } from '@codegouvfr/react-dsfr/ToggleSwitch';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from '@/styles/contribution/toggleEditionMode.module.scss';

export default function ToogleEditMode() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const editModeEnabled = pathname === '/edition';
  const toggleView = () => {
    if (editModeEnabled) {
      router.push(`/carte?${searchParams.toString()}`);
    } else {
      router.push(`/edition?${searchParams.toString()}`);
    }
  };

  return (
    <>
      <div className={`fr-btn ${styles.editToggle}`}>
        <div>Mode édition</div>
        <ToggleSwitch
          checked={editModeEnabled}
          className=""
          // need to put something
          label={<span></span>}
          labelPosition="left"
          onChange={toggleView}
        />
      </div>
    </>
  );
}
