import styles from '@/styles/feveFound.module.scss';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useEffect } from 'react';

const feveFoundModal = createModal({
  id: 'feve-found-modal',
  isOpenedByDefault: false,
});

export default function FeveFound({ showModal }: { showModal?: boolean }) {
  if (!showModal) {
    return null;
  }

  setTimeout(() => {
    feveFoundModal.open();
  }, 300);

  return (
    <>
      <feveFoundModal.Component title="Félicitations !" size="small">
        <div className={styles.container}>
          <h2>Vous avez trouvé une fève !</h2>
          <p>
            Merci pour votre contribution au Référentiel National des Bâtiments.
            Votre signalement aide à améliorer la qualité des données pour tous
            les utilisateurs.
          </p>
          <p>Continuez à explorer et à signaler d'autres bâtiments !</p>
        </div>
      </feveFoundModal.Component>
    </>
  );
}
