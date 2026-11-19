import { Alert } from '@codegouvfr/react-dsfr/Alert';

import CopyButton from '@/components/CopyButton';

const KEEP_CODES_WARNING =
  "Conservez ces codes de secours en lieu sûr. Chacun permet une seule connexion si vous n'avez plus accès à votre application. Ils ne seront plus affichés.";
const API_TOKEN_RENEWED_WARNING =
  " Votre clé d'API a aussi été renouvelée : remplacez l'ancienne partout où vous l'utilisez.";

export default function BackupCodes({
  codes,
  apiTokenRenewed = false,
}: {
  codes: string[];
  apiTokenRenewed?: boolean;
}) {
  const backupCodes = codes.join('\n');

  return (
    <>
      <Alert
        className="fr-mb-3w"
        description={
          apiTokenRenewed
            ? KEEP_CODES_WARNING + API_TOKEN_RENEWED_WARNING
            : KEEP_CODES_WARNING
        }
        severity="warning"
        small
        closable={false}
      />
      <pre data-testid="backup-codes" style={{ columns: 2, maxWidth: '20rem' }}>
        {backupCodes}
      </pre>
      <div className="fr-mb-3w">
        <CopyButton
          valueToCopy={backupCodes}
          label="Copier les codes"
          okMsg="Codes copiés"
        />
      </div>
    </>
  );
}
