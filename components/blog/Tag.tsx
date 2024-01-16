// Style
import styles from '@/styles/blogTag.module.scss'

import Badge from '@codegouvfr/react-dsfr/Badge';





export default function Tag({ tag }) {

    const severityMap = {
        'energie': 'new',
        'dpe': 'new',
        'tech': 'info'
    }
    
    const severity = severityMap[tag.slug] || 'info'

    return (
        <>
            <Badge noIcon small severity={severity}>{tag.name}</Badge>  
        </>
    )
}