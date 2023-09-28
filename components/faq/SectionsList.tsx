import styles from '@/styles/faq.module.scss'

import Entry from "@/components/faq/Entry"

export default function FaqSections(sections: any) {

    return (
        <>
            {sections.sections.map((s: any) => {
                return (
                    <>
                    <div className={styles.faq__section}>
                    <h2 className={styles.faq__sectionTitle} key={s.key} id={s.key}>{s.name}</h2>
                
                    {s.entries.map((e: any) => {

                        

                        return (
                            <Entry entry={e} />
                        )
                    })}
                    </div>
                    </>
                )
            })}

                

            
        </>
    )

}