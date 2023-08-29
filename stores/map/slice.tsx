'use client'

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    addressSearch: {
        q: null,
        results: null
    },
    moveTo: {
        lat: 46.820936580547134,
        lng: 2.852577494863663,
        zoom: 5
    },
    panelBdg: null,
    
}

export const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        setMoveTo(state, action) {

            if (action.payload.lat != state.moveTo.lat || 
                action.payload.lng != state.moveTo.lng || 
                action.payload.zoom != state.moveTo.zoom) {
                state.moveTo = action.payload
            }

        },
  

    }
})

export const { setMoveTo } = mapSlice.actions
export default mapSlice.reducer