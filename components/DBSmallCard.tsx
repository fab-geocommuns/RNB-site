// Styles
import styles from '@/styles/dbsmallcard.module.scss'

// Components
import ImageNext from 'next/image'
import Badge from '@codegouvfr/react-dsfr/Badge';

export default function Entry({db, }) {

    const imagePath = function(filaname: string) {
        return `/images/databases/${filaname}`
    }

    return (
        <>
            
            

                <div className={styles.card}>

                    <div className={styles.logoShell}>
                    <ImageNext className={styles.logo} width="30" height="30" src={imagePath(db.image)} alt={db.name} />
                    </div>
                    <div className={styles.body}>


                        <div className={styles.titleBlock}>
                            <h3 className={styles.title}><a href={db.url}>{db.name}</a></h3>
                            <p>{db.featured_summary}</p>
                        </div>
                        
                        
                        
                  
                        
                    </div>

                    
                    
                

                </div>
                

            


            
            
        </>
    )

}