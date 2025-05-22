'use client';

import AddressInput from '@/components/address/AddressInput';
import EditableMap from '@/components/map/EditableMap';
import { useState } from 'react';

function MapPlayground() {
  const [editedShape, setEditedShape] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [zoom, setZoom] = useState<number>(12);
  const [layers, setLayers] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <>
      <pre>
        <code>
          {JSON.stringify(
            {
              editedShape,
              coords,
              zoom,
              isEditing,
            },
            null,
            2,
          )}
        </code>
      </pre>
      <button
        onClick={() => setIsEditing(!isEditing)}
        style={{ backgroundColor: isEditing ? 'red' : 'green' }}
      >
        toggle editing
      </button>
      <button onClick={() => setEditedShape(null)}>clear edited shape</button>
      <EditableMap
        editedShape={editedShape}
        onEditedShapeChange={setEditedShape}
        isEditing={isEditing}
        coords={coords}
        setCoords={setCoords}
        zoom={zoom}
        setZoom={setZoom}
        layers={layers}
        onLayersChange={setLayers}
        onCancelEdition={() => setIsEditing(false)}
      />
    </>
  );
}

export default function PlaygroundPage() {
  const [displayInput, setDisplayInput] = useState(false);
  return (
    <div>
      <details>
        <summary>Address input</summary>
        {!displayInput && (
          <a href="#" onClick={() => setDisplayInput(true)}>
            Show input
          </a>
        )}
        {displayInput && (
          <AddressInput
            onSuggestionSelected={(suggestion) => {
              alert('suggestion selected ' + JSON.stringify(suggestion));
            }}
            onQueryResults={(query, results) => {
              return results.sort((a, b) =>
                a.properties.id.localeCompare(b.properties.id),
              );
            }}
            onEscapePress={() => {
              setDisplayInput(false);
            }}
            render={(props) => (
              <input
                {...props}
                autoFocus
                style={{ width: '240px', border: '1px solid red' }}
              />
            )}
            renderSuggestion={(suggestion) => (
              <span style={{ border: '1px dotted green' }}>
                {suggestion.properties.label} (clé ban:{' '}
                {suggestion.properties.id})
              </span>
            )}
            geocodeQueryParams={{
              postcode: '75020',
            }}
          />
        )}
      </details>
      <details>
        <summary>Map</summary>
        <MapPlayground />
      </details>
    </div>
  );
}
