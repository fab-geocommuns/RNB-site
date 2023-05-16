import { useContext } from 'react';
import styles from './BdgOperations.module.css'
import { AdsContext } from './AdsContext';
import BdgOp from "@/components/BdgOp"
import InputErrors from '@/components/InputErrors';

export default function BdgOperations({errors = null}) {

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
                
                <p>Sélectionnez sur la carte les bâtiments concernés par l&apos;ADS.<br />
                Si vous ne les trouvez pas, vous pouvez les ajouter au RNB.</p>
                
                <p><a href="#" onClick={handleCreateNewBdg} className={`fr-btn fr-btn--secondary fr-btn--sm ${styles.createLink}`}>Ajouter un bâtiment au RNB</a></p>

                <InputErrors errors={errors} />

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