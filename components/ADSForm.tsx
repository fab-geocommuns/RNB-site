'use client'

import { useState, useRef } from 'react';
import BdgOperations from './BdgOperations';
import ADSMap from './ADSMap';
import { AdsContext } from './AdsContext';
import AdsEditing from '../logic/ads';
import styles from './ADSForm.module.css'
import { MapContext } from '@/components/MapContext';
import BuildingsMap from '@/logic/map';
import AddressSearch from '@/components/AddressSearch'


export default function ADSForm({ data = {
    
        issue_number: "",
        insee_code: "",
        issue_date: "",
        buildings_operations: []
    
    
} }) {

    let bdgmap = new BuildingsMap({
        position: {
            center: null,
            zoom: null
        }
    })

    const [mapCtx, setMapCtx] = useState(bdgmap)

    const editingState = {
            data: data
    }

    let ads = new AdsEditing(editingState)
    const [ctx, setCtx] = useState(ads);
    const init_issue_number = useRef(editingState.data.issue_number ? editingState.data.issue_number.slice() : "") // slice() to clone the string

    const getActionURL = () => {
        if (ads.isSaved()) {
            return process.env.NEXT_PUBLIC_API_BASE + '/ads/'
        } else {
            return process.env.NEXT_PUBLIC_API_BASE + '/ads/' + init_issue_number.current + "/"
        }
    }

    const getActionMethod = () => {
        if (ads.isSaved()) {
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



    const submitForm = async (e) => {

        e.preventDefault();

        const url = getActionURL()
        const method = getActionMethod()
        const res = await fetch(url, {
            cache: 'no-cache',
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token 3d4dbc70f60d0666fbd8ead6df4eb0c3fcf376bf',
            },
            body: JSON.stringify(ctx.state.data)
        })
        const data = await res.json()

        return

    }

    return (
        <MapContext.Provider value={[mapCtx, setMapCtx]}>
            <AdsContext.Provider value={[ctx, setCtx]}>


                <div className={styles.grid}>
                    <div className={styles.formCol}>
                        <form onSubmit={submitForm}>


                            <div className="fr-input-group">

                                <label
                                    className="fr-label"
                                    htmlFor="issue_number">Numéro d&apos;ADS</label>
                                <input
                                    className="fr-input"
                                    type="text"
                                    name="issue_number"
                                    id="issue_number"
                                    value={ctx.issue_number}
                                    onChange={handleInputChange}
                                />

                            </div>
                            <div className="fr-input-group">
                                <label className="fr-label" htmlFor="issue_date">Date d&apos;émission</label>
                                <input
                                    className="fr-input"
                                    type="date"
                                    name="issue_date"
                                    id="issue_date"
                                    value={ctx.issue_date}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="fr-input-group">
                                <label className="fr-label" htmlFor="insee_code">Code INSEE</label>
                                <input
                                    className="fr-input"
                                    type="text"
                                    name="insee_code"
                                    id="insee_code"
                                    value={ctx.insee_code}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>

                                <BdgOperations />
                            </div>

                            <div>
                                <button className='fr-btn' type="submit">Enregistrer</button>
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

            </AdsContext.Provider>
        </MapContext.Provider>
    )

}