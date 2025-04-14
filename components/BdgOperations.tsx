import { useContext } from 'react';
import styles from './BdgOperations.module.css';
import { AdsContext } from './AdsContext';
import BdgOp from '@/components/BdgOp';
import InputErrors from '@/components/InputErrors';

export default function BdgOperations({ errors = null }) {
  // @ts-ignore
  const [ads, setAds] = useContext(AdsContext);

  const createNewBdg = () => {
    const op = ads.addNewBdg();
    ads.setMovingBdg(op.building.identifier);
    setAds(ads.clone());
  };

  // @ts-ignore
  const handleCreateNewBdg = (e) => {
    e.preventDefault();
    createNewBdg();
  };

  return (
    <>
      <div className={styles.grid}>
        <div>
          <label className="fr-label" htmlFor="">
            Bâtiments
          </label>
          <div className={styles.instructionShell}>
            Sélectionnez les bâtiments sur la carte à droite
          </div>
          <div className={styles.bdgNotFound}>
            Vous ne trouvez pas le bâtiment ?{' '}
            <a onClick={handleCreateNewBdg} href="#">
              Ajoutez le à la carte
            </a>
            .
          </div>

          <InputErrors errors={errors} />

          <ul className={styles.opsList}>
            {ads.state.data.buildings_operations?.map((bdgop: any) => (
              <BdgOp key={bdgop.building.identifier} data={bdgop} />
            ))}
          </ul>
        </div>
        <div className={styles.mapShell}></div>
      </div>
    </>
  );
}
