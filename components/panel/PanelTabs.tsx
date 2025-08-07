import styles from '@/styles/panelBuilding.module.scss';
import ImageNext from 'next/image';
import bdgInfoIcon from '@/public/icons/map-pin-2-line.svg';
import bdgHistoryIcon from '@/public/icons/history-line.svg';
import bdgEditIcon from '@/public/icons/pencil-line.svg';
import { usePathname } from 'next/navigation';

export default function PanelTabs({ rnbId }: { rnbId: string }) {
  const pathname = usePathname();
  return (
    <>
      <ul className={styles.nav}>
        <li className={styles.navItem}>
          <a
            href={`/carte?q=${rnbId}`}
            className={`${styles.navLink} ${pathname === '/carte' ? styles.navLinkCurrent : ''}`}
          >
            <ImageNext alt="Informations" src={bdgInfoIcon} />
            Informations
          </a>
        </li>

        <li className={styles.navItem}>
          <a className={styles.navLink} href={`/batiments/${rnbId}/historique`}>
            <ImageNext alt="Historique" src={bdgHistoryIcon} />
            Historique
          </a>
        </li>
        <li className={styles.navItem}>
          <a
            href={`/edition?q=${rnbId}`}
            className={`${styles.navLink} ${pathname === '/edition' ? styles.navLinkCurrent : ''}`}
          >
            <ImageNext alt="Modifier" src={bdgEditIcon} />
            Modifier
          </a>
        </li>
      </ul>
    </>
  );
}
