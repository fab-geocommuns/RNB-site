import styles from '@/styles/feveFound.module.scss';
import { createModal } from '@codegouvfr/react-dsfr/Modal';

const feveFoundModal = createModal({
  id: 'feve-found-modal',
  isOpenedByDefault: true,
});

export default function FeveFound() {
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
