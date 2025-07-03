import { fr } from '@codegouvfr/react-dsfr';
import CopyToClipboard from '../util/CopyToClipboard';
import styles from '@/styles/panelBuilding.module.scss';
import { useState } from 'react';
// Analytics
import va from '@vercel/analytics';

export default function RNBIDCopier({ rnbId }: { rnbId: string }) {
  const [copied, setCopied] = useState(false);

  function addSpace(rnb_id: string) {
    if (rnb_id) {
      return rnb_id.split('').map((char, i) => {
        let classes = '';
        if (i == 4 || i == 8) {
          classes = styles['small-left-padding'];
        }
        return (
          <span key={'rnb-id-char' + i} className={classes}>
            {char}
          </span>
        );
      });
    } else {
      return null;
    }
  }
  const easyRnbId = () => {
    return addSpace(rnbId);
  };

  const handleCopy = () => {
    va.track('rnbid-copied', { rnb_id: rnbId });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className={styles.rnbidShell}>
      <div className={styles.rnbidShell__id}>{easyRnbId()}</div>

      <CopyToClipboard onCopy={() => handleCopy()} text={rnbId}>
        <div className={styles.rnbidShell__copy}>
          {copied ? (
            <span>
              Copié <i className={fr.cx('fr-icon-success-line')}></i>
            </span>
          ) : (
            <span>
              Copier <i className={fr.cx('fr-icon-clipboard-line')}></i>
            </span>
          )}
        </div>
      </CopyToClipboard>
    </div>
  );
}
