import styles from '@/styles/faq.module.scss';

// @ts-ignore
export default function Summary({ sections }) {
  return (
    <>
      <div className={styles.faq__summaryShell}>
        // @ts-ignore
        {sections.map((section, index) => (
          <>
            <div className={styles.faq__summarySection}>
              <p className={styles.faq__summarySectionName} key={section.key}>
                <b>{section.name}</b>
              </p>
              <ul>
                // @ts-ignore
                {section.entries.map((entry, index) => (
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
