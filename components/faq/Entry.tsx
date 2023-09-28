

export default function Entry({entry, }) {

    return (
        <>
            <h3 id={entry.key}>{entry.question}</h3>
            <div dangerouslySetInnerHTML={{ __html: entry.answer }} />
        </>
    )

}