// DSFR & styles
import { fr } from '@codegouvfr/react-dsfr';
import styles from '@/components/BdgOp.module.css';

// Contexts
import { useContext } from 'react';
import { AdsContext } from './AdsContext';
import { MapContext } from '@/components/MapContext';

export default function BdgOp({ data = null }) {
  // @ts-ignore
  const [ads, setAds] = useContext(AdsContext);
  // @ts-ignore
  const [mapCtx, setMapCtx] = useContext(MapContext);

  const chooseOpOption = (op: string, idenfitier: string) => {
    ads.updateBdgOperation(op, idenfitier);

    setAds(ads.clone());
  };

  const centerMap = () => {
    if (hasPosition()) {
      mapCtx.data.position.center = [
        // @ts-ignore
        data.building.geometry.coordinates[0],
        // @ts-ignore
        data.building.geometry.coordinates[1],
      ];
      mapCtx.data.position.zoom = 20;

      setMapCtx(mapCtx.clone());
    }
  };

  const removeBdg = () => {
    // @ts-ignore
    ads.removeIdentifier(data.building.identifier);
    setAds(ads.clone());
  };

  const isEditing = () => {
    // @ts-ignore
    return ads.state.bdg_move == data.building.identifier;
  };
  const isNew = () => {
    // @ts-ignore
    return data.building.rnb_id == 'new';
  };

  const hasPosition = () => {
    // @ts-ignore
    return data.building.geometry != null;
  };

  const helpText = () => {
    if (isEditing()) {
      if (hasPosition()) {
        return 'Déplacer le bâtiment sur la carte';
      } else {
        return 'Placez le bâtiment sur la carte';
      }
    } else {
      if (!hasPosition()) {
        return 'Bâtiment non positionné';
      }
    }

    return '';
  };

  const opLabel = () => {
    if (isNew()) {
      return 'Ajout au RNB';
    }

    // @ts-ignore
    return data.building.rnb_id;
  };

  const moveBtnTitle = () => {
    if (isEditing()) {
      return 'Valider le déplacement';
    }

    return 'Déplacer ce bâtiment';
  };

  const toggleEditing = () => {
    if (isEditing()) {
      ads.state.bdg_move = null;
    } else {
      // @ts-ignore
      ads.state.bdg_move = data.building.identifier;
    }

    setAds(ads.clone());
    return;
  };

  return (
    <>
      {/* @ts-ignore */}
      <li className={styles.op} key={data.building.rnb_id}>
        <div>
          <span className={styles.opIdentifierShell}>
            <span
              onClick={() => {
                centerMap();
              }}
              className={styles.opIdentifier}
            >
              {isNew() ? '' : 'Identifiant : '}
              {opLabel()}
            </span>
            <span className={styles.centerHelp}>{helpText()}</span>
          </span>
        </div>
        <span
          onClick={() => {
            // @ts-ignore
            chooseOpOption('build', data.building.identifier);
          }}
          // @ts-ignore
          className={`${styles.opOption} ${styles.opOption__build} ${data.operation == 'build' ? styles.active : ''}`}
        >
          Construction neuve
        </span>
        <span
          onClick={() => {
            // @ts-ignore
            chooseOpOption('modify', data.building.identifier);
          }}
          // @ts-ignore
          className={`${styles.opOption} ${styles.opOption__modify} ${data.operation == 'modify' ? styles.active : ''}`}
        >
          Modification
        </span>
        <span
          onClick={() => {
            // @ts-ignore
            chooseOpOption('demolish', data.building.identifier);
          }}
          // @ts-ignore
          className={`${styles.opOption} ${styles.opOption__demolish}  ${data.operation == 'demolish' ? styles.active : ''}`}
        >
          Démolition complète
        </span>

        <span className={styles.opToolsShell}>
          {isNew() && (
            <span
              title={moveBtnTitle()}
              onClick={toggleEditing}
              className={`${styles.opTool} ${styles.opMove} ${isEditing() ? styles.opTool__active : ''}`}
            >
              <i
                className={` ${styles.opToolIconActive} ${fr.cx('fr-icon-drag-move-2-line')}`}
              ></i>
              <i
                className={` ${styles.opToolIconHover} ${fr.cx('fr-icon-check-line')}`}
              ></i>
            </span>
          )}
          <span
            title="Retirer ce bâtiment de l'ADS"
            onClick={removeBdg}
            className={`${styles.opTool} ${styles.opRemove}`}
          >
            <i className={fr.cx('fr-icon-delete-line')}></i>
          </span>
        </span>
      </li>
    </>
  );
}
