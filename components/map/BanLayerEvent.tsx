import maplibregl from 'maplibre-gl';
import { escapeHtml } from '../util/misc';

export const displayBANPopup = (map: maplibregl.Map, addressFeature: any) => {
  let certStr = 'Adresse BAN non certifiée';
  if (addressFeature.properties.certifie) {
    certStr = 'Adresse BAN certifiée';
  }

  const props = addressFeature?.properties ?? {};

  new maplibregl.Popup()
    .setLngLat(addressFeature.geometry.coordinates)
    .setHTML(
      `
      <div class="banPop">
      <h6 class="banPopTitle">${certStr}</h6>
      <p class="banPopBody">${escapeHtml(props.numero)} ${escapeHtml(props.suffixe)}  ${escapeHtml(props.nomVoie)}<br />
      ${escapeHtml(props.nomCommune)}</p>
      <p class="banPopFooter">Clé d'interopérabilité BAN : ${escapeHtml(props.id)}</p>
      </div>
       `,
    )
    .addTo(map);
};
