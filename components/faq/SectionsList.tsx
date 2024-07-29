'use client';
import styles from '@/styles/faq.module.scss';

import Entry from '@/components/faq/Entry';
import { useEffect } from 'react';

export default function FaqSections(sections: any) {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView());
      }
    }
  }, []);

  return (
    <>
      {sections.sections.map((s: any) => {
        return (
          <div className={styles.faq__section} key={s.key} id={s.key}>
            <h2 className={styles.faq__sectionTitle}>{s.name}</h2>

            {s.entries.map((e: any) => {
              return <Entry key={e.key} entry={e} />;
            })}
          </div>
        );
      })}
    </>
  );
}
