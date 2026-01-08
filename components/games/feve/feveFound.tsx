import styles from '@/styles/feveFound.module.scss';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Image from 'next/image';
import { useEffect } from 'react';

const feveFoundModal = createModal({
  id: 'feve-found-modal',
  isOpenedByDefault: false,
});

export default function FeveFound({ showModal }: { showModal?: boolean }) {
  useEffect(() => {
    if (showModal !== false) {
      setTimeout(() => {
        feveFoundModal.open();
      }, 300);
    }
  }, [showModal]);

  if (!showModal) {
    return null;
  }

  return (
    <>
      <feveFoundModal.Component
        concealingBackdrop={false}
        title="Vous avez trouvé la fève du département !"
        className={styles.feveModal}
      >
        <div className={styles.feveContainer}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Image
              src={`/images/feves/feve-33.png`}
              alt="Gironde"
              width={300}
              height={300}
            />
            <p className={styles.departmentName}>Gironde</p>
          </div>
        </div>
      </feveFoundModal.Component>
    </>
  );
}
