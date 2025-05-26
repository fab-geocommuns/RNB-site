'use client';

import AddressInput from '@/components/address/AddressInput';
import EditableMap from '@/components/map/EditableMap';
import { useState } from 'react';

function MapPlayground() {
  const [editedShape, setEditedShape] = useState<GeoJSON.Geometry | null>(null);
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
      <MapPlayground />
    </div>
  );
}
