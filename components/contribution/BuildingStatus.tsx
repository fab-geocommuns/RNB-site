import { Select } from '@codegouvfr/react-dsfr/SelectNext';
import styles from '@/styles/contribution/editPanel.module.scss';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';

export default function BuildingStatus({
  status,
  onChange,
  disabled,
}: {
  status: BuildingStatusType;
  onChange: (status: BuildingStatusType) => void;
  disabled?: boolean;
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
              onChange(event.target.value as BuildingStatusType);
            },
            disabled,
            title: disabled ? 'Le bâtiment est désactivé' : '',
          }}
          label=""
          options={statusList}
        />
      </div>
    </>
  );
}
