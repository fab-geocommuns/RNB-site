// Styles
import styles from '@/styles/homedblist.module.scss'

// Components
import ImageNext from 'next/image'


export default function HomeDBList({dbs, dbsCount}) {

    const imagePath = function(filaname: string) {
        return `/images/databases/${filaname}`
    }

    return (
        <>
            
                <div className={styles.list}>

                    {dbs.map((db) => {
                        return <a href={'/outils-services/rapprochement#' + db.key} className={styles.db}>
                                    

                                        <div className={styles.imgShell}>
                                            <ImageNext className={styles.logo} width="30" height="30" src={imagePath(db.image)} alt={db.name} />
                                        </div>
                                        
                                        <div className={styles.dbDescription}>
                                            <div className={styles.title}>{db.name}</div>
                                            <div className={styles.desc}>{db.featured_summary}</div>
                                        </div>
                                        
                                    
                                </a>
                                

                    })}
                    <a href="/outils-services/rapprochement" className={styles.cta + " " + styles.db}>
                        <span>Voir les {dbsCount} bases contenant des identifiants RNB</span>
                    <i className='fr-icon-arrow-right-line' />
                    </a>

                </div>
            
            




            
                

            


            
            
        </>
    )

}