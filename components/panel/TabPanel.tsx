import styles from '@/styles/contribution/editPanel.module.scss';
import { usePathname, useSearchParams } from 'next/navigation';
export default function TabPanel() {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const tabIsActive = (route: string): string => {
    return pathName === route ? 'tabActive' : '';
  };

  return (
    <>
      <ul
        className={`fr-tabs__list ${styles.tabList}`}
        role="tablist"
        aria-label="[Onglets de liens entre informations et modification]"
      >
        <li
          className={`${styles[tabIsActive('/carte')]} ${styles.tab}`}
          role="presentation"
        >
          {tabIsActive('/carte').length ? (
            <span className={`${styles.tabLink} ${styles.tabLinkDisabled}`}>
              Informations
            </span>
          ) : (
            <a className={styles.tabLink} href={`/carte?${searchParams}`}>
              Informations
            </a>
          )}
        </li>
        <li
          className={`${styles[tabIsActive('/edition')]} ${styles.tab}`}
          role="presentation"
        >
          {tabIsActive('/edition').length ? (
            <span className={`${styles.tabLink} ${styles.tabLinkDisabled}`}>
              Modifier
            </span>
          ) : (
            <a
              className={styles.tabLink}
              href={`/edition?${searchParams.toString()}`}
            >
              Modifier
            </a>
          )}
        </li>
      </ul>
    </>
  );
}
