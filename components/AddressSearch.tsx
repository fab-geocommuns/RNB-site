import {MapContext} from '@/components/MapContext'
import { useContext, useRef } from 'react';

export default function AddressSearch() {

    const apiUrl = 'https://api-adresse.data.gouv.fr/search/'
    const [mapCtx, setMapCtx] = useContext(MapContext)
    const addressInput = useRef(null)

    const handleSubmitForm = async (e) => {
        
        e.preventDefault();
        const best_point = await geocode(addressInput.current.value);
        mapCtx.data.best_point = best_point
        setMapCtx(mapCtx.clone())

    }
    const geocode = async (query: string) => {

        let best_point = null;
        let result = await fetchBanAPI(query);

        if (result.features.length > 0) {
            best_point = result.features[0]
        }

        return best_point

    }
    const fetchBanAPI = async (query) => {

        let query_url = new URL(apiUrl);
        query_url.searchParams.set('q', query);

        return new Promise((resolve, reject) => {

            fetch(query_url)
                .then(response => response.json())
                .then(data => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                })
        })

    }

    return (
        <>
        <form action="#" onSubmit={handleSubmitForm}>
        <input 
        className="fr-input" 
        placeholder='Chercher une adresse'
        type="text" 
        name="address" 
        id="address"
        ref={addressInput}
         />
        </form>
        </>
    )

}