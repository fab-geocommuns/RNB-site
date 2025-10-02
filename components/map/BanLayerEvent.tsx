import maplibregl from 'maplibre-gl';

export const displayBANPopup = (map: maplibregl.Map, addressFeature: any) => {
  new maplibregl.Popup()
    .setLngLat(addressFeature.geometry.coordinates)
    .setHTML('hello W')
    .addTo(map);
};
