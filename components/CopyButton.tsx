'use client';

import CopyToClipboard from '@/components/util/CopyToClipboard';
import { useState } from 'react';

export default function CopyButton({
  valueToCopy,
  label,
  okMsg,
}: {
  valueToCopy: string;
  label: string;
  okMsg: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <CopyToClipboard onCopy={() => handleCopy()} text={valueToCopy}>
      <button className="fr-btn fr-btn--secondary" type="button">
        {copied ? (
          <span>
            <i className="fr-icon-success-line"></i> {okMsg}
          </span>
        ) : (
          <span>{label}</span>
        )}
      </button>
    </CopyToClipboard>
  );
}
