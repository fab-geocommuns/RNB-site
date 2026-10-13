'use client';

import { ReactNode } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { HelpTopic } from '@/stores/edition/edition-slice';
import HelpButton from './HelpButton';

// Titre de section accompagné d'un bouton « ? » qui ouvre l'aide
// correspondante dans le panneau d'aide, à côté du panneau d'édition.
export default function FieldHelp({
  title,
  topic,
}: {
  title: ReactNode;
  topic: HelpTopic;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: fr.spacing('2v'),
      }}
    >
      {title}
      <HelpButton topic={topic} />
    </div>
  );
}
