import { Select } from '@codegouvfr/react-dsfr/SelectNext';
import styles from '@/styles/contribution/editPanel.module.scss';

export default function BuildingStatus({
  status,
  onChange,
}: {
  status: string;
  onChange: (status: string) => void;
}) {
  const statusList = [
    {
      label: 'Construit',
      value: 'constructed',
    },
    {
      label: 'En ruine',
      value: 'notUsable',
    },
    {
      label: 'Démoli',
      value: 'demolished',
    },
  ];

  return (
    <>
      <div className={styles.panelSection}>
        <span className={`fr-text--xs ${styles.sectionTitle}`}>Statut</span>
        <Select
          nativeSelectProps={{
            value: status,
            onChange: (event) => {
              onChange(event.target.value);
            },
          }}
          label=""
          options={statusList}
        />
      </div>
    </>
  );
}
