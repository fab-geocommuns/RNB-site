import Entry from "@/components/faq/Entry"

export default function FaqSections(sections: any) {

    return (
        <>
            {sections.sections.map((s: any) => {
                return (
                    <>
                    <h2 key={s.key} id={s.key}>{s.name}</h2>
                
                    {s.entries.map((e: any) => {

                        

                        return (
                            <Entry entry={e} />
                        )
                    })}

                    </>
                )
            })}

                

            
        </>
    )

}