type Props = {
  rnbId: string;
};

import styles from '@/styles/contribution/editPanel.module.scss';

function PanelHeader({ children }: { children: React.ReactNode }) {
  return <div className={styles.header}>{children}</div>;
}

export default function RNBIDheader({ rnbId }: Props) {
  return (
    <PanelHeader>
      <span>Identifiant RNB</span>
      <span>{rnbId}</span>
    </PanelHeader>
  );
}
