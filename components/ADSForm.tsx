'use client'

import { useState } from 'react';




export default function ADSForm({ads}) {

    const [formData, setFormData] = useState(ads);


    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        setFormData({...formData, [name]: value})
    }

    return (
        <form>

            <h3>{ads.issue_number}</h3>

            <label htmlFor="issue_number">Numéro d'ADS</label>
            <input 
            type="text" 
            name="issue_number" 
            id="issue_number"
            value={formData.issue_number}
            onChange={handleInputChange}
             />
            <label htmlFor="issue_date">Date d'émission</label>
            <input type="date" name="issue_date" id="issue_date" />
            
        </form>
    )

}