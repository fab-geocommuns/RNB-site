'use client';

import { useSearchParams } from 'next/navigation';
import styles from '@/styles/login.module.scss';
import { useState } from 'react';
import ProFranceConnect from '@/components/authentication/ProFranceConnect';
import ClassicSignInSignUp from '@/components/authentication/ClassicSignInSignUp';

export default function AuthBlock() {
  const searchParams = useSearchParams();
  const displayParam = searchParams.get('display');
  const initialForm = displayParam === 'signup' ? 'signup' : 'login';
  const [displayedClassicForm, setDisplayedClassicForm] = useState(initialForm);

  const handleFormSwitcherClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    formToDisplay: 'login' | 'signup',
  ) => {
    e.preventDefault();
    setDisplayedClassicForm(formToDisplay);
  };

  return (
    <>
      <h2 className={styles.titleShell}>
        {displayedClassicForm === 'login' ? 'Se connecter' : "S'inscrire"} avec
        Pro Connect
      </h2>
      <ProFranceConnect />

      <div className={styles.orSeparator}>ou</div>

      <div className={styles.formSwitcherShell}></div>
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

      <div className="fr-mt-12v">
        <i className="fr-icon-refresh-fill" />
        {displayedClassicForm == 'login' && (
          <a href="#" onClick={(e) => handleFormSwitcherClick(e, 'signup')}>
            Afficher le formulaire d'inscription
          </a>
        )}
        {displayedClassicForm == 'signup' && (
          <a href="#" onClick={(e) => handleFormSwitcherClick(e, 'login')}>
            Afficher le formulaire de connexion
          </a>
        )}
      </div>
    </>
  );
}
