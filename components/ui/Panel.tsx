type PanelWrapperProps = {
  children: React.ReactNode;
}

type PanelHeaderProps = {
  children: React.ReactNode;
  onClose?: () => void;
}

type PanelBodyProps = {
  children: React.ReactNode;
}

type PanelFooterProps = {
  children: React.ReactNode;
}

export function PanelWrapper({ children }: PanelWrapperProps) {
  return <div className={styles.shell} data-testid="visu-panel">
          <div className={styles.content}>
            {children}
          </div>
        </div>
}

export function PanelHeader({ children }: PanelHeaderProps) {
  return <div className={styles.head}>
              <h1 className={styles.title}>{children}</h1>
              <a href="#" onClick={onClose} className={styles.closeLink}>
                <i className="fr-icon-close-line" />
              </a>
            </div>
}

export function PanelBody({ children }: PanelBodyProps) {
  return <div className={styles.panelBody}>{children}</div>;
}

export function PanelFooter({ children }: PanelFooterProps) {
}