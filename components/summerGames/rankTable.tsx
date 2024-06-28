// Styles
import styles from '@/styles/summerGames.module.scss'

// Comps
import ImageNext from 'next/image'

// Images
import medalGoldPic from '@/public/images/summerGames/medal_gold.svg'
import medalSilverPic from '@/public/images/summerGames/medal_silver.svg'
import medalBronzePic from '@/public/images/summerGames/medal_bronze.svg'


export default function RankTable( {title, ranks}) {

    function getMedalPic(index) {
        switch (index) {
            case 0:
                return medalGoldPic
            case 1:
                return medalSilverPic
            case 2:
                return medalBronzePic
            default:
                return null
        }
    }

    return (
        <>
        <div>

            <div className={styles.legend}>{title}</div>

            <div className={styles.rankTable}>

            {ranks.map((rank, index) => (

                
                    <div key={index} className={styles.rankRow}>

                        <div className={styles.rankMedalShell}>
                            {index <= 2 ? (
                                <ImageNext className={styles.medal} src={getMedalPic(index)}></ImageNext>
                            ):null}
                        </div>
                        <div className={styles.rankNameShell}>{rank.name}</div>
                        <div className={styles.rankCountShell}>{rank.count}</div>
                            
                        
                        

                    </div>
                    

                ))}

            </div>
            
                    
                    
                        


        </div>
        </>
    )

}