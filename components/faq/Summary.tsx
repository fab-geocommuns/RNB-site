import styles from '@/styles/faq.module.scss';

export default function Summary({ sections }: any) {
  return (
    <>
      <div className={styles.faq__summaryShell}>
        {sections.map((section: any, index: any) => (
          <>
            <div className={styles.faq__summarySection}>
              <p className={styles.faq__summarySectionName} key={section.key}>
                <b>{section.name}</b>
              </p>
              <ul>
                {section.entries.map((entry: any, index: any) => (
                  <li key={entry.key} className={styles.faq__summaryEntry}>
                    <a
                      className={styles.faq__summaryLink}
                      href={`#${entry.key}`}
                    >
                      {entry.question}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ))}
      </div>
    </>
  );
}
