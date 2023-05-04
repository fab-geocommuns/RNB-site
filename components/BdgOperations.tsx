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

    return (
        <>
            <div className={styles.grid}>
            
            <div>
            <div>Bâtiments concernés par l'ADS</div>

                <p>moving {ads.state.bdg_move}</p>
                <p>Séléctionnez les bâtiments concernés sur la carte ou <span onClick={createNewBdg} className='fr-link'>créez un nouveau bâtiment</span>.</p>

                <ul className={styles.opsList}>
                    {ads.state.data.buildings_operations?.map((bdgop) => (
                        <BdgOp data={bdgop} />
                    ))}
                </ul>
            </div>
            <div className={styles.mapShell}>
                
            </div>
            </div>
            

        </>
    )

}