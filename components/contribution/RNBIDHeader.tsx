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
      <span className="fr-text--xs">Identifiant RNB</span>
      <h1
        className="fr-text--lg fr-m-0 fr-pl-2v"
        style={{ display: 'inline-block' }}
      >
        {rnbId}
      </h1>
    </PanelHeader>
  );
}
