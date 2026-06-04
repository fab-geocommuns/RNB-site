'use client';

import styles from '@/styles/loader.module.scss';

export function Loader({ inline = false }: { inline?: boolean }) {
  return <div className={inline ? styles.loaderInline : styles.loader}></div>;
}
