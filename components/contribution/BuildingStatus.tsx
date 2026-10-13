import { useId } from 'react';
import { Select } from '@codegouvfr/react-dsfr/SelectNext';
import styles from '@/styles/contribution/building.module.scss';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import FieldHelp from './FieldHelp';

export default function BuildingStatus({
  status,
  onChange,
}: {
  status: BuildingStatusType;
  onChange: (status: BuildingStatusType) => void;
}) {
  const selectId = useId();
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
        <FieldHelp
          title={
            <label
              htmlFor={selectId}
              className={`fr-text--xs ${styles.sectionTitle}`}
            >
              Statut physique
            </label>
          }
          topic="status"
        />
        <Select
          nativeSelectProps={{
            id: selectId,
            value: status,
            onChange: (event) => {
              onChange(event.target.value as BuildingStatusType);
            },
          }}
          label=""
          hint="État physique actuel du bâtiment sur le terrain."
          options={statusList}
        />
      </div>
    </>
  );
}
