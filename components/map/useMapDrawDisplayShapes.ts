import { useEffect } from 'react';

function removeShapes(drawRef: MapboxDraw, shapeIdsToRemove: string[]) {
  for (const shapeId of shapeIdsToRemove) {
    if (shapeId) {
      drawRef.delete(shapeId);
    }
  }
}

function addShapes(drawRef: MapboxDraw, shapesToDraw: GeoJSON.Feature[]) {
  for (const shape of shapesToDraw) {
    console.log('addShape', shape);
    drawRef.add(shape);
  }
}

export function useMapDrawDisplayShapes(
  map: maplibregl.Map | undefined,
  drawRef: React.RefObject<MapboxDraw | null>,
  shapesToDraw: (GeoJSON.Geometry | null)[],
  shapeIds: (string | null)[],
) {
  // Removing/re-adding all shapes removes the selection
  // So we need to remove only the shapes that are not in the new shapesToDraw
  useEffect(() => {
    if (map && drawRef.current) {
      const geoJSONToDraw = shapesToDraw
        .filter((shape) => shape !== null)
        .map((shape, index) => ({
          type: 'Feature',
          geometry: shape,
          id: shapeIds[index],
          properties: {},
        }));
      const existingShapeIds = drawRef.current
        .getAll()
        .features.map((shape) => shape.id as string | null);
      const shapeIdsToRemove = existingShapeIds.filter(
        (shapeId) => !shapeIds.includes(shapeId),
      );
      const geoJSONToAdd = geoJSONToDraw.filter(
        (shape) => !existingShapeIds.includes(shape.id as string | null),
      );
      removeShapes(
        drawRef.current,
        shapeIdsToRemove.filter((shapeId) => shapeId !== null),
      );
      addShapes(drawRef.current, geoJSONToAdd as GeoJSON.Feature[]);
    }
  }, [map, shapesToDraw, shapeIds]);
}
