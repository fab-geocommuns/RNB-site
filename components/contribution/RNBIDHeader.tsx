import styles from '@/styles/contribution/editPanel.module.scss';

export default function RNBIDheader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.header}>{children}</div>;
}
