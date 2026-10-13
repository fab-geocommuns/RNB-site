'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { HelpTopic } from '@/stores/edition/edition-slice';
import { HELP_TOPICS } from './helpContents';
import { HELP_PANEL_ID } from './HelpPanel';

// Titre de section accompagné d'un bouton « ? » qui ouvre l'aide
// correspondante dans le panneau d'aide, à côté du panneau d'édition.
export default function FieldHelp({
  title,
  topic,
}: {
  title: ReactNode;
  topic: HelpTopic;
}) {
  const dispatch: AppDispatch = useDispatch();
  const isOpen = useSelector(
    (state: RootState) => state.edition.helpTopic === topic,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // À la fermeture du panneau d'aide (croix, Échap), le focus revient sur le
  // bouton qui l'a ouvert, sauf si l'utilisateur est déjà passé ailleurs.
  useEffect(() => {
    if (wasOpen.current && !isOpen) {
      const active = document.activeElement;
      const panel = document.getElementById(HELP_PANEL_ID);
      if (active === document.body || (panel && panel.contains(active))) {
        buttonRef.current?.focus();
      }
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

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
      <Button
        ref={buttonRef}
        iconId="fr-icon-question-line"
        priority={isOpen ? 'secondary' : 'tertiary no outline'}
        size="small"
        title={`Aide : ${HELP_TOPICS[topic].title}`}
        onClick={() =>
          dispatch(Actions.edition.setHelpTopic(isOpen ? null : topic))
        }
        nativeButtonProps={{
          'aria-expanded': isOpen,
          'aria-controls': HELP_PANEL_ID,
        }}
      />
    </div>
  );
}
