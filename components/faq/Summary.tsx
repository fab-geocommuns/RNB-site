export default function Summary({ sections, }) {


    return (
        <>
        <div>
            {sections.map((section, index) => (
                <>
                <p key={section.key}><b>{section.name}</b></p>
                <ul>
                    {section.entries.map((entry, index) => (
                        <li><a href={`#${entry.key}`}>{entry.question}</a></li>
                    ))}
                </ul>
                </>
            ))}
        </div>
        </>
    )

}