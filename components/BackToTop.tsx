'use client';

import styles from '@/styles/backToTop.module.scss';
import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(window.pageYOffset > 0);

  useEffect(() => {
    // clean up code
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onScroll = () => {
    return setIsVisible(window.pageYOffset > 0);
  };

  if (!isVisible) {
    return null;
  } else {
    return (
      <a className={`fr-btn fr-btn--secondary ${styles.button}`} href="#">
        <i className="fr-icon-arrow-up-line"></i> Retour en haut
      </a>
    );
  }
}
