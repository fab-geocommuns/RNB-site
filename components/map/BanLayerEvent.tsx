import maplibregl from 'maplibre-gl';

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });

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
      <h6 class="banPopTitle">${escapeHtml(certStr)}</h6>
      <p class="banPopBody">${escapeHtml(props.numero)} ${escapeHtml(props.suffixe)}  ${escapeHtml(props.nomVoie)}<br />
      ${escapeHtml(props.nomCommune)}</p>
      <p class="banPopFooter">Clé d'interopérabilité BAN : ${escapeHtml(props.id)}</p>
      </div>
       `,
    )
    .addTo(map);
};
