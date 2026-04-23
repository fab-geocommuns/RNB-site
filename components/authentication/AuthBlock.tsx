'use client';

import styles from '@/styles/login.module.scss';
import ProFranceConnect from '@/components/authentication/ProFranceConnect';
import ClassicSignInSignUp from '@/components/authentication/ClassicSignInSignUp';

interface AuthBlockProps {
  mode: 'login' | 'signup';
}

export default function AuthBlock({ mode }: AuthBlockProps) {
  return (
    <>
      <h2 className={styles.titleShell}>
        {mode === 'login' ? 'Se connecter' : "S'inscrire"} avec Pro Connect
      </h2>
      <ProFranceConnect />

      <div className={styles.orSeparator}>ou</div>

      <div className={styles.titleShell}>
        <h2>
          {mode === 'login'
            ? 'Se connecter avec mon email'
            : "S'inscrire avec mon email"}
        </h2>
      </div>

      <ClassicSignInSignUp displayedForm={mode} />
    </>
  );
}
