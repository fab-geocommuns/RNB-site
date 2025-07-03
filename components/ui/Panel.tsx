import styles from '@/styles/ui/panel.module.scss';

type PanelWrapperProps = {
  children: React.ReactNode;
  withActions?: boolean;
};

type PanelHeaderProps = {
  children: React.ReactNode;
  onClose?: () => void;
};

type PanelBodyProps = {
  children: React.ReactNode;
};

type PanelFooterProps = {
  children: React.ReactNode;
};

export function PanelWrapper({ children, withActions }: PanelWrapperProps) {
  return (
    <div
      className={[styles.shell, withActions && styles.withActions].join(' ')}
      data-testid="visu-panel"
    >
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export function PanelHeader({ children, onClose }: PanelHeaderProps) {
  return (
    <div className={styles.head}>
      <h1 className={styles.title}>{children}</h1>
      <a href="#" onClick={onClose} className={styles.closeLink}>
        <i className="fr-icon-close-line" />
      </a>
    </div>
  );
}

type PanelSectionProps = {
  children?: React.ReactNode;
  title?: React.ReactNode;
  body?: React.ReactNode;
};

export function PanelSection({ children, title, body }: PanelSectionProps) {
  return (
    <div className={styles.panelSection}>
      {title && <PanelSectionTitle>{title}</PanelSectionTitle>}
      {body && <PanelSectionBody>{body}</PanelSectionBody>}
      {children}
    </div>
  );
}

type PanelSectionTitleProps = {
  children: React.ReactNode;
};

export function PanelSectionTitle({ children }: PanelSectionTitleProps) {
  return <h2 className={styles.sectionTitle}>{children}</h2>;
}

type PanelSectionBodyProps = {
  children: React.ReactNode;
};

export function PanelSectionBody({ children }: PanelSectionBodyProps) {
  return <div className={styles.sectionBody}>{children}</div>;
}

export function PanelBody({ children }: PanelBodyProps) {
  return <div className={styles.body}>{children}</div>;
}

export function PanelFooter({ children }: PanelFooterProps) {
  return <div className={styles.footer}>{children}</div>;
}
