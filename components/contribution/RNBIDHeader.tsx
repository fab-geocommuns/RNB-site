import React, { useState } from 'react';
import { Tooltip } from '@codegouvfr/react-dsfr/Tooltip';
import ImageNext from 'next/image';
import CopyToClipboard from '@/components/util/CopyToClipboard';
import styles from '@/styles/contribution/RNBIDHeader.module.scss';
import copyIcon from '@/public/icons/file-copy-line.svg';
import checkIcon from '@/public/icons/check-line.svg';
import va from '@vercel/analytics';

export default function RNBIDheader({ rnbId }: { rnbId: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    va.track('rnbid-copied', { rnb_id: rnbId });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  const easyRnbId = () => {
    return addSpace(rnbId);
  };
  return (
    <div>
      <h2 className={styles.sectionTitle}>Identifiant RNB</h2>
      <div className={styles.rnbidShell}>
        <div className={styles.rnbidShell__id}>{easyRnbId()}</div>
        <Tooltip kind="hover" title="Copier l'identifiant RNB">
          <CopyToClipboard onCopy={() => handleCopy()} text={rnbId}>
            <div className={styles.rnbidShell__copy}>
              {copied ? (
                <ImageNext alt="Copié" src={checkIcon} />
              ) : (
                <ImageNext alt="Copier l'identifiant RNB" src={copyIcon} />
              )}
            </div>
          </CopyToClipboard>
        </Tooltip>
      </div>
    </div>
  );
}

function addSpace(rnbId: string) {
  if (rnbId) {
    return rnbId.split('').map((char, i) => {
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
  } else return null;
}
