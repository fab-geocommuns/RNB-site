import { useContext } from 'react';
import styles from './BdgOperations.module.css'
import { AdsContext } from './AdsContext';
import BdgOp from "@/components/BdgOp"

export default function BdgOperations() {

    const [ads, setAds] = useContext(AdsContext)    

    const createNewBdg = () => {

        const op = ads.addNewBdg()
        ads.setMovingBdg(op.building.identifier)
        setAds(ads.clone())

    }

    const handleCreateNewBdg = (e) => {
        e.preventDefault()
        createNewBdg()
    }

    return (
        <>
            <div className={styles.grid}>
            
            <div>
            <div>Bâtiments concernés par l'ADS</div>

                <p className={styles.helpText}>Séléctionnez les bâtiments concernés sur la carte <br />
                ou <a href="#" onClick={handleCreateNewBdg} className={`"fr-link" ${styles.createLink}`}>créez un nouveau bâtiment</a>.</p>

                <ul className={styles.opsList}>
                    {ads.state.data.buildings_operations?.map((bdgop) => (
                        <BdgOp key={bdgop.building.identifier} data={bdgop} />
                    ))}
                </ul>
            </div>
            <div className={styles.mapShell}>
                
            </div>
            </div>
            

        </>
    )

}