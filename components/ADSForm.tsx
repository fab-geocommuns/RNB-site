'use client';

import { useState, useRef, useEffect } from 'react';

// Comps
import BdgOperations from '@/components/BdgOperations';
import ADSMap from '@/components/ADSMap';
import AddressSearchMap from '@/components/AddressSearchMap';

import InputErrors from '@/components/InputErrors';

// Auth
import { useSession } from 'next-auth/react';

// Contexts
import { AdsContext } from './AdsContext';
import { MapContext } from '@/components/MapContext';

// Logic
import AdsEditing from '@/logic/ads';
import BuildingsMap from '@/logic/map';

// DSFR and styles
import styles from './ADSForm.module.css';
import { useRouter } from 'next/navigation';

// Bus
import Bus from '@/utils/Bus';

export default function ADSForm({ data }) {
  //////////////
  // Contexts

  // ADS
  const editingState = {
    data: data,
  };
  let ads = new AdsEditing(editingState);
  const [ctx, setCtx] = useState(ads);
  const adsCopy = useRef(ctx);

  // Local UI State
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Map
  let bdgmap = new BuildingsMap({
    position: {
      center: null,
      zoom: null,
    },
  });
  const [mapCtx, setMapCtx] = useState(bdgmap);

  // Router
  const router = useRouter();

  // Session
  const { data: session, status } = useSession();

  //////////////
  // Starting values
  const init_file_number = useRef(
    editingState.data.file_number ? editingState.data.file_number.slice() : '',
  ); // slice() to clone the string

  const isNewAds = () => {
    return init_file_number.current == '';
  };

  const getActionURL = () => {
    if (isNewAds()) {
      return process.env.NEXT_PUBLIC_API_BASE + '/ads/?from=site';
    } else {
      return (
        process.env.NEXT_PUBLIC_API_BASE +
        '/ads/' +
        init_file_number.current +
        '/?from=site'
      );
    }
  };

  const getActionMethod = () => {
    if (isNewAds()) {
      return 'POST';
    } else {
      return 'PUT';
    }
  };

  const handleInputChange = (e) => {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    adsCopy.current.state.data[name] = value;
    setCtx(adsCopy.current.clone());
  };

  const submitForm = async (e) => {
    e.preventDefault();

    setIsSaving(true);
    setErrors({});

    Bus.emit('flashClose');

    const url = getActionURL();
    const method = getActionMethod();

    const res = await fetch(url, {
      cache: 'no-cache',
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + session?.accessToken,
      },
      body: JSON.stringify(adsCopy.current.state.data),
    });
    const data = await res.json();
    setIsSaving(false);

    if (res.status == 201 || res.status == 200) {
      // We update the issue number so it can be used if we resubmit the form
      init_file_number.current = ctx.state.data.file_number;

      Bus.emit('flashAfterRedirect', {
        msg: 'Dossier enregistré',
        type: 'success',
      });

      router.push('/ads/');
    }

    if (res.status == 400) {
      setErrors(data);

      Bus.emit('flash', {
        msg: 'Votre dossier a une erreur',
        type: 'error',
      });
    }

    return;
  };

  const handleDelete = async () => {
    if (confirm('Voulez-vous vraiment supprimer ce dossier ADS ?')) {
      const deleteUrl = getActionURL();
      const deleteMethod = 'DELETE';

      const res = await fetch(deleteUrl, {
        cache: 'no-cache',
        method: deleteMethod,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Token ' + session?.accessToken,
        },
      });

      if (res.status == 204) {
        Bus.emit('flashAfterRedirect', {
          msg: 'Dossier supprimé',
          type: 'success',
        });
        router.push('/ads');
      }
    }
  };

  useEffect(() => {
    adsCopy.current = ctx;
  }, [ctx]);

  return (
    <AdsContext.Provider value={[ctx, setCtx]}>
      <MapContext.Provider value={[mapCtx, setMapCtx]}>
        <div className={styles.grid}>
          <div className={styles.formCol}>
            <form onSubmit={submitForm}>
              <div className="fr-input-group">
                <label className="fr-label" htmlFor="file_number">
                  Numéro de dossier ADS
                </label>
                <input
                  required
                  className="fr-input"
                  type="text"
                  name="file_number"
                  id="file_number"
                  value={ctx.file_number}
                  placeholder="Ex: PC12341234A1234"
                  onChange={handleInputChange}
                />
                <InputErrors errors={errors.file_number} />
              </div>
              <div className="fr-input-group">
                <label className="fr-label" htmlFor="decided_at">
                  Date de décision
                </label>
                <input
                  required
                  className="fr-input"
                  type="date"
                  name="decided_at"
                  id="decided_at"
                  value={ctx.decided_at}
                  onChange={handleInputChange}
                />
                <InputErrors errors={errors.decided_at} />
              </div>

              <div className="fr-input-group">
                <label className="fr-label">Centrer carte</label>
                <AddressSearchMap />
              </div>

              <div>
                <BdgOperations errors={errors.buildings_operations} />
              </div>

              <div className={`fr-my-10v ${styles.btnGroup}`}>
                <button
                  {...(isSaving ? { disabled: true } : {})}
                  className="fr-btn"
                  type="submit"
                >
                  {isSaving ? 'Enregistrement ...' : 'Enregistrer le dossier'}
                </button>

                {!isNewAds() && (
                  <>
                    <button
                      className="fr-btn fr-btn--tertiary-no-outline"
                      type="button"
                      onClick={() => {
                        handleDelete();
                      }}
                    >
                      Supprimer le dossier
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
          <div className={styles.mapCol}>
            <div className={styles.mapShell}>
              <div className={styles.addresseSearchShell}></div>
              <ADSMap />
            </div>
          </div>
        </div>
      </MapContext.Provider>
    </AdsContext.Provider>
  );
}
