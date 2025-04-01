// Style
import Badge from '@codegouvfr/react-dsfr/Badge';

// @ts-ignore
export default function Tag({ tag }) {
  const severityMap = {
    energie: 'new',
    dpe: 'new',
    tech: 'info',
    geocommun: 'success',
  };

  // @ts-ignore
  const severity = severityMap[tag.slug] || 'info';

  return (
    <>
      <Badge noIcon small severity={severity}>
        {tag.name}
      </Badge>
    </>
  );
}
