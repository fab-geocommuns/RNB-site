import styles from '@/styles/faq.module.scss';

export default function Entry({ entry }) {
  return (
    <>
      <div className={styles.faq__entry}>
        <h3 className={styles.faq__entryQuestion} id={entry.key}>
          {entry.question}
        </h3>
        <div dangerouslySetInnerHTML={{ __html: entry.answer }} />
      </div>
    </>
  );
}
