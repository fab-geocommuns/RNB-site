'use client'

// Styles
import styles from '@/styles/homedblist.module.scss'

// Components
import ImageNext from 'next/image'

// Analytics
import va from "@vercel/analytics"

export default function HomeDBList({dbs, dbsCount}) {

    const imagePath = function(filaname: string) {
        return `/images/databases/${filaname}`
    }

    const trackDbClick = (db) => {
        
        return () => {
            va.track("db-click-home", {
                db_key: db.key,
                db_name: db.name
            })
        }

    }

    const trackShowAllDbClick = () => {
        return () => {
            va.track("db-click-home", {
                db_key: "show-all",
                db_name: "show-all"   
            })
        }
    }

    return (
        <>
            
                <div className={styles.list}>

                    {dbs.map((db) => {
                        return <a onClick={trackDbClick(db)} href={'/outils-services/rapprochement#' + db.key} className={styles.db} key={db.key}>
                                    

                                        <div className={styles.imgShell}>
                                            <ImageNext className={styles.logo} width="30" height="30" src={imagePath(db.image)} alt={db.name} />
                                        </div>
                                        
                                        <div className={styles.dbDescription}>
                                            <div className={styles.title}>{db.name}</div>
                                            <div className={styles.desc}>{db.featured_summary}</div>
                                        </div>
                                        
                                    
                                </a>
                                

                    })}
                    <a onClick={trackShowAllDbClick()} href="/outils-services/rapprochement" className={styles.cta + " " + styles.db}>
                        <span>Voir les {dbsCount} bases contenant des identifiants RNB</span>
                    <i className='fr-icon-arrow-right-line' />
                    </a>

                </div>
            
            




            
                

            


            
            
        </>
    )

}