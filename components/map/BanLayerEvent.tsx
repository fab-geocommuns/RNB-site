import maplibregl from 'maplibre-gl';

export const displayBANPopup = (map: maplibregl.Map, addressFeature: any) => {
  let certStr = 'Adresse BAN non certifiée';
  if (addressFeature.properties.certifie) {
    certStr = 'Adresse BAN certifiée';
  }

  console.log('addressFeature', addressFeature);

  new maplibregl.Popup()
    .setLngLat(addressFeature.geometry.coordinates)
    .setHTML(
      `
      <idv class="banPop">
      <h6 class="banPopTitle">${certStr}</h6>
      <p class="banPopBody">${addressFeature.properties.numero || ''} ${addressFeature.properties.suffixe || ''}  ${addressFeature.properties.nomVoie || ''}<br />
      ${addressFeature.properties.nomCommune || ''}</p>
      <p class="banPopFooter">Clé BAN : ${addressFeature.properties.id}</p>
      </div>
       `,
    )
    .addTo(map);
};
