import { Select } from '@codegouvfr/react-dsfr/SelectNext';
import styles from '@/styles/contribution/editPanel.module.scss';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import { PanelSection } from '../ui/Panel';

export default function BuildingStatus({
  status,
  onChange,
}: {
  status: BuildingStatusType;
  onChange: (status: BuildingStatusType) => void;
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
      <PanelSection
        title="Statut du bâtiment"
        body={
          <Select
            nativeSelectProps={{
              value: status,
              onChange: (event) => {
                onChange(event.target.value as BuildingStatusType);
              },
            }}
            label=""
            options={statusList}
          />
        }
      />
    </>
  );
}
