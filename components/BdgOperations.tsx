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
            <div>editing {ads?.isEditingNewBdg() ? "oui": "non"}</div>
            
            <div>
                
                <p>Séléctionnez les bâtiments existants concernés sur la carte </p>
                <p>Si le bâtiment n'existe pas, créez le</p>
                
                <p><a href="#" onClick={handleCreateNewBdg} className={`"fr-btn" ${styles.createLink}`}>créez un nouveau bâtiment</a>.</p>

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