import styles from '@/styles/contribution/copyInlineBtn.module.scss';

import React, { useState } from 'react';
import { Tooltip } from '@codegouvfr/react-dsfr/Tooltip';
import ImageNext from 'next/image';
import CopyToClipboard from '@/components/util/CopyToClipboard';

import copyIcon from '@/public/icons/file-copy-line.svg';
import checkIcon from '@/public/icons/check-line.svg';

export default function CopyInlineBtn({
  tooltipText,
  strToCopy,
}: {
  tooltipText: string;
  strToCopy: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Tooltip kind="hover" title={tooltipText}>
      <CopyToClipboard onCopy={() => handleCopy()} text={strToCopy}>
        <div className={styles.copyBtn}>
          {copied ? (
            <ImageNext alt="Copié" src={checkIcon} />
          ) : (
            <ImageNext alt={tooltipText} src={copyIcon} />
          )}
        </div>
      </CopyToClipboard>
    </Tooltip>
  );
}
