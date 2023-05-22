'use client'

import { useState, useRef } from 'react';

// Comps
import BdgOperations from '@/components/BdgOperations';
import ADSMap from '@/components/ADSMap';
import AddressSearch from '@/components/AddressSearch'
import FlashMessage from '@/components/FlashMessage';
import InputErrors from '@/components/InputErrors';
import AsyncSelect from 'react-select/async';

// Auth
import { useSession } from 'next-auth/react'

// Contexts
import { AdsContext } from './AdsContext';
import { MapContext } from '@/components/MapContext';

// Logic
import AdsEditing from '@/logic/ads';
import BuildingsMap from '@/logic/map';
import Flash from '@/logic/flash';

// DSFR and styles
import styles from './ADSForm.module.css'
import { useRouter } from 'next/navigation';


export default function ADSForm({ data, defaultCity }) {

    //////////////
    // Contexts

    // ADS
    const editingState = {
            data: data
    }
    let ads = new AdsEditing(editingState)
    const [ctx, setCtx] = useState(ads);

    // Local UI State
    const [isSaving, setIsSaving] = useState(false)
    const [errors, setErrors] = useState({})

    // Map
    let bdgmap = new BuildingsMap({
        position: {
            center: null,
            zoom: null
        }
    })
    const [mapCtx, setMapCtx] = useState(bdgmap)
    
    // Flash msg
    const [flash, setFlash] = useState(new Flash())

    // Router
    const router = useRouter()

    // Session
    const { data: session, status } = useSession()
    

    ////////////// 
    // Starting values
    const init_issue_number = useRef(editingState.data.issue_number ? editingState.data.issue_number.slice() : "") // slice() to clone the string

    let city = null
    if (defaultCity) {
        city = {
            "value": defaultCity.code_insee,
            "label": defaultCity.name
        }
    }

    const isNewAds = () => {
        return init_issue_number.current == ""
    }

    const getActionURL = () => {
        if (isNewAds()) {
            return process.env.NEXT_PUBLIC_API_BASE + '/ads/'
        } else {
            return process.env.NEXT_PUBLIC_API_BASE + '/ads/' + init_issue_number.current + "/"
        }
    }

    


    const getActionMethod = () => {
        if (isNewAds()) {
            return 'POST'
        } else {
            return 'PUT'
        }
    }

    const handleInputChange = (e) => {
        const target = e.target;
        const value = target.value;
        const name = target.name;
        ads.state.data[name] = value
        setCtx(ads.clone())
    }

    const handleCitySelectChange = (choice) => {
        ads.state.data["insee_code"] = choice.value
        setCtx(ads.clone())
    }


    const submitForm = async (e) => {

        e.preventDefault();

        setIsSaving(true)
        setErrors({})
        closeFeedback()

        const url = getActionURL()
        const method = getActionMethod()

        const res = await fetch(url, {
            cache: 'no-cache',
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + session?.accessToken,
            },
            body: JSON.stringify(ctx.state.data)
        })
        const data = await res.json()
        setIsSaving(false)

        
        if (res.status == 201 || res.status == 200) {
            // We update the issue number so it can be used if we resubmit the form
            init_issue_number.current = ctx.state.data.issue_number
            showSuccess()
        }

        if (res.status == 400) {
            setErrors(data)
            showBadRequest(data)
        }

        return

    }

    const handleDelete = async () => {

        console.log("Delete")

        if (confirm("Voulez-vous vraiment supprimer cette ADS ?")) {

            const deleteUrl = getActionURL()
            const deleteMethod = 'DELETE'

            const res = await fetch(deleteUrl, {
                cache: 'no-cache',
                method: deleteMethod,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + session?.accessToken,
                }  
            })

            if (res.status == 204) {
                router.push('/ads')
            }

        }
    }

    const closeFeedback = () => {
        flash.open = false
        setFlash({...flash})
    }

    const showBadRequest = (data) => {

        flash.title = "Votre ADS a une erreur"
        flash.desc = data.detail
        flash.open = true
        flash.type = "error"
        flash.closable = true

        setFlash({...flash})

    }

    const showSuccess = () => {

        flash.title = "ADS enregistrée"
        flash.desc = ""
        flash.open = true
        flash.type = "success"
        flash.closable = true

        setFlash({...flash})

    }

    const searchCities = async (inputValue: string) => {

        const url = new URL(process.env.NEXT_PUBLIC_API_BASE + '/cities/')
        url.searchParams.set('q', inputValue);

        return new Promise((resolve, reject) => {

            fetch(url)
            .then(response => response.json())
            .then(data => {
                const options = data.results.map(d => ({
                    "value": d.code_insee,
                    "label": d.name
                }))
                resolve(options)
            })
            .catch(err => {
                reject(err)
            })

        })

    }

    return (
        <AdsContext.Provider value={[ctx, setCtx]}>
        <MapContext.Provider value={[mapCtx, setMapCtx]}>
            

                <FlashMessage flash={flash} />

                <div className={styles.grid}>

                    

                    <div className={styles.formCol}>

                        <form onSubmit={submitForm}>


                            <div className="fr-input-group">

                                <label
                                    className="fr-label"
                                    htmlFor="issue_number">Numéro d&apos;ADS</label>
                                <input
                                    required
                                    className="fr-input"
                                    type="text"
                                    name="issue_number"
                                    id="issue_number"
                                    value={ctx.issue_number}
                                    placeholder='Ex: 2023-0001-XXXX'
                                    onChange={handleInputChange}
                                />
                                <InputErrors errors={errors.issue_number} />

                            </div>
                            <div className="fr-input-group">
                                <label className="fr-label" htmlFor="issue_date">Date d&apos;émission</label>
                                <input
                                    required
                                    className="fr-input"
                                    type="date"
                                    name="issue_date"
                                    id="issue_date"
                                    value={ctx.issue_date}
                                    onChange={handleInputChange}
                                />
                                <InputErrors errors={errors.issue_date} />
                            </div>
                            <div className="fr-input-group">
                                <label className="fr-label" htmlFor="insee_code">Ville</label>
                                
                                  <AsyncSelect 
                                  required={true}
                                  name="insee_code"
                                  defaultValue={city}
                                  onChange={handleCitySelectChange}
                                  loadOptions={searchCities}
                                  loadingMessage={() => "Chargement..."}
                                  noOptionsMessage={(e) => {
                                        if (e.inputValue.length > 0) {
                                            return "Aucune ville trouvée"
                                        }
                                        return "Chercher par nom ou code INSEE"
                                        
                                  }}
                                  placeholder="Aucun ville séléctionnée"
                                  />
                                  <InputErrors errors={errors.insee_code} />

                            </div>

                            <div>
                            
                                
                                <BdgOperations errors={errors.buildings_operations} />
                            </div>

                            <div className={`fr-my-10v ${styles.btnGroup}`}>
                                <button 
                                {...(isSaving ? {disabled: true} : {})}
                                className='fr-btn' type="submit">{isSaving ? "Enregistrement ..." : "Enregistrer l'ADS"}</button>


                                <button className='fr-btn fr-btn--tertiary-no-outline' type="button" onClick={() => {handleDelete()}}>Supprimer l&apos;ADS</button>

                            </div>


                        </form>
                    </div>
                    <div className={styles.mapCol}>
                        <div className={styles.mapShell}>
                            <div className={styles.addresseSearchShell}>
                                <AddressSearch />
                            </div>
                            <ADSMap />
                        </div>
                    </div>
                </div>
                </MapContext.Provider>
            </AdsContext.Provider>
        
    )

}