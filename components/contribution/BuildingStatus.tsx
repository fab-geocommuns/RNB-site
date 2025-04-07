import { Select } from '@codegouvfr/react-dsfr/SelectNext';

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
      <Select
        nativeSelectProps={{
          value: status,
          onChange: (event) => {
            onChange(event.target.value);
          },
        }}
        label="Statut du bâtiment"
        options={statusList}
      />
    </>
  );
}
