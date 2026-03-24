'use client';

import { useSearchParams } from 'next/navigation';
import styles from '@/styles/login.module.scss';
import { useState } from 'react';
import ProFranceConnect from '@/components/authentication/ProFranceConnect';
import ClassicSignInSignUp from '@/components/authentication/ClassicSignInSignUp';

export default function AuthBlock() {
  const [displayedClassicForm, setDisplayedClassicForm] = useState('login');

  const handleFormSwitcherClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    formToDisplay: 'login' | 'signup',
  ) => {
    e.preventDefault();
    setDisplayedClassicForm(formToDisplay);
  };

  return (
    <>
      <h2 className={styles.titleShell}>Accès direct</h2>
      <ProFranceConnect />

      <div className={styles.orSeparator}>ou</div>

      <div className={styles.formSwitcherShell}>
        <i className="fr-icon-refresh-fill" />
        {displayedClassicForm == 'signup' && (
          <a href="#" onClick={(e) => handleFormSwitcherClick(e, 'login')}>
            Afficher le formulaire de connexion
          </a>
        )}

        {displayedClassicForm == 'login' && (
          <a href="#" onClick={(e) => handleFormSwitcherClick(e, 'signup')}>
            Afficher le formulaire d'inscription
          </a>
        )}
      </div>
      <div className={styles.titleShell}>
        <h2>
          {displayedClassicForm == 'login'
            ? 'Se connecter avec mon email'
            : "S'inscrire avec mon email"}
        </h2>
      </div>

      <ClassicSignInSignUp
        displayedForm={displayedClassicForm as 'login' | 'signup'}
      />
    </>
  );
}
