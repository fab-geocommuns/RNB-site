'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fr } from '@codegouvfr/react-dsfr';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import GenericPanel from '@/components/panel/GenericPanel';
import styles from '@/styles/genericPanel.module.scss';
import { HELP_TOPICS } from './helpContents';

export const HELP_PANEL_ID = 'edition-help-panel';

// Panneau d'aide non bloquant, collé à droite du panneau d'édition : on peut
// lire l'aide tout en continuant à remplir le formulaire.
export default function HelpPanel() {
  const dispatch: AppDispatch = useDispatch();
  const topic = useSelector((state: RootState) => state.edition.helpTopic);
  const contentRef = useRef<HTMLDivElement>(null);

  // À l'ouverture ou au changement de sujet, le focus va sur le contenu pour
  // que les lecteurs d'écran l'annoncent.
  useEffect(() => {
    if (topic) contentRef.current?.focus();
  }, [topic]);

  if (!topic) return null;

  const { title, Content } = HELP_TOPICS[topic];
  const close = () => dispatch(Actions.edition.setHelpTopic(null));

  return (
    <div
      id={HELP_PANEL_ID}
      role="region"
      aria-label={`Aide : ${title}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape') close();
      }}
    >
      <GenericPanel
        title={`Aide : ${title}`}
        onClose={close}
        className={styles.besideEditPanelShell}
        testId="edition-help-panel"
        body={
          <div
            ref={contentRef}
            tabIndex={-1}
            className={fr.cx('fr-text--sm')}
            style={{ outline: 'none' }}
          >
            <Content />
          </div>
        }
      />
    </div>
  );
}
