'use client'

import { useState } from 'react';




export default function ADSForm({ads}) {

    const [formData, setFormData] = useState(ads);

    const getActionURL = () => {
        if (isCreation()) {
            return process.env.NEXT_PUBLIC_API_BASE + '/ads/'
        } else {
            return process.env.NEXT_PUBLIC_API_BASE + '/ads/' + ads.issue_number + "/"
        }
        
    }

    const getActionMethod = () => {
        if (isCreation()) {
            return 'POST'
        } else {
            return 'PUT'
        }
    }

    const isCreation = () => {
        return ads.issue_number === undefined
    }

    const handleInputChange = (e) => {
        const target = e.target;
        const value = target.value;
        const name = target.name;
        setFormData({...formData, [name]: value})
    }

    const submitForm = async (e) => {

        console.log('submit form')

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
            body: JSON.stringify(formData)
        })
        const data = await res.json()

        console.log(data)
        
        return

    }

    return (
        <form onSubmit={submitForm}>

            <h3>{ads.issue_number}</h3>
            <p>{ads.insee_code}</p>
            <div>
            <label htmlFor="issue_number">Numéro d'ADS</label>
            <input 
                type="text" 
                name="issue_number" 
                id="issue_number"
                value={formData.issue_number}
                onChange={handleInputChange}
             />
             </div>
             <div>
                <label htmlFor="issue_date">Date d'émission</label>
                <input
                 type="date" 
                 name="issue_date" 
                 id="issue_date" 
                 value={formData.issue_date}
                 onChange={handleInputChange}
                 />
             </div>
            <div>
                <button type="submit">Enregistrer</button>
            </div>

            
        </form>
    )

}