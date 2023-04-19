'use client'

import { useState } from 'react';
import BdgOperations from './BdgOperations';
import { AdsContext } from './AdsContext';
import Ads from '../logic/ads';

export default function ADSForm({data = {} }) {

    let ads = new Ads(data)
    const [ctx, setCtx] = useState(ads);

    const getActionURL = () => {
        if (ads.isSaved()) {
            return process.env.NEXT_PUBLIC_API_BASE + '/ads/'
        } else {
            return process.env.NEXT_PUBLIC_API_BASE + '/ads/' + ads.issue_number + "/"
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
        ads.data[name] = value
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
            body: JSON.stringify(ctx.data)
        })
        const data = await res.json()

        console.log(data)
        
        return

    }

    return (
        <AdsContext.Provider value={[ctx, setCtx]}>
        <form onSubmit={submitForm}>

            <h3>{ads.data.issue_number}--</h3>
            <p>{ads.data.insee_code}</p>
            <div>
            <label htmlFor="issue_number">Numéro d'ADS</label>
            <input 
                type="text" 
                name="issue_number" 
                id="issue_number"
                value={ctx.issue_number}
                onChange={handleInputChange}
             />
             </div>
             <div>
                <label htmlFor="issue_date">Date d'émission</label>
                <input
                 type="date" 
                 name="issue_date" 
                 id="issue_date" 
                 value={ctx.issue_date}
                 onChange={handleInputChange}
                 />
             </div>
             <div>
                <label htmlFor="insee_code">Code INSEE</label>
                <input
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
                <button type="submit">Enregistrer</button>
            </div>

            
        </form>
        </AdsContext.Provider>
    )

}