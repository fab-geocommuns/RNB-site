import styles from '@/styles/feveFound.module.scss';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Image from 'next/image';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const feveFoundModal = createModal({
  id: 'feve-found-modal',
  isOpenedByDefault: false,
});

export default function FeveFound({ showModal }: { showModal?: boolean }) {
  const confettiCount = 200;
  const confettiDefaults = {
    colors: ['#B86949', '#E3A75B', '#472F4A'],
    origin: { x: 0.5, y: 0.7 },
    zIndex: 1751,
  };
  const fire = function (particleRatio: number, opts: any) {
    confetti({
      ...confettiDefaults,
      ...opts,
      particleCount: Math.floor(confettiCount * particleRatio),
    });
  };

  useEffect(() => {
    if (showModal !== false) {
      setTimeout(() => {
        feveFoundModal.open();

        // Trigger confetti
        setTimeout(() => {
          fire(0.25, {
            spread: 26,
            startVelocity: 55,
          });
          fire(0.2, {
            spread: 60,
          });
          fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
          });
          fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
          });
          fire(0.1, {
            spread: 120,
            startVelocity: 45,
          });
        }, 50);
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
