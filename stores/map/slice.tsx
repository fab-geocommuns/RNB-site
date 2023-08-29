'use client'

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    addressSearch: {
        q: null,
        results: null
    },
    moveTo: {
        lat: null,
        lng: null,
        zoom: null
    },
    marker: {
        lat: null,
        lng: null,
    },
    panelBdg: null,
    
}

export const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        setMarker(state, action) {
            state.marker = action.payload
        },
        setAddressSearchQuery(state, action) {
            if (action.payload != state.addressSearch.q) {
                state.addressSearch.q = action.payload
            }
        },
        setAddressSearchResults(state, action) {
            state.addressSearch.results = action.payload
        },
        setMoveTo(state, action) {

            if (action.payload.lat != state.moveTo.lat || 
                action.payload.lng != state.moveTo.lng || 
                action.payload.zoom != state.moveTo.zoom) {
                state.moveTo = action.payload
            }

        },
    },
      
    extraReducers(builder) {
        builder.addCase(fetchBdg.fulfilled, (state, action) => {
            state.panelBdg = action.payload
        })
    }

})

export const fetchBdg = createAsyncThunk('map/fetchBdg', async (bdgId: string) => {
    const url = bdgApiUrl(bdgId)
    const response = await fetch(url)
    const data = await response.json()
    return data
})

export function bdgApiUrl(bdgId: string) {
    return process.env.NEXT_PUBLIC_API_BASE + '/buildings/' + bdgId
}


export const { setMarker, setMoveTo, setAddressSearchQuery, setAddressSearchResults } = mapSlice.actions
export default mapSlice.reducer