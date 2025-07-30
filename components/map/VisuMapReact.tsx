import React, { useState, useEffect } from 'react';
import { Map, Layer, Source } from 'react-map-gl/maplibre';
import satellite from '@/components/map/mapstyles/satellite.json';
import type { LayerProps } from 'react-map-gl/maplibre';
import type {
  FeatureCollection,
  Feature,
  Point,
  MultiPolygon,
  Polygon,
  Geometry,
} from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface VisuMapReactProps {
  point?: { coordinates: number[] };
  shape?: Geometry;
}

const VisuMapReact = ({ point, shape }: VisuMapReactProps) => {
  const [viewState, setViewState] = useState({
    latitude: point?.coordinates[1] || 44.820271366,
    longitude: point?.coordinates[0] || -0.572593087,
    zoom: 17,
  });
  const [building, setBuilding] = useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });

  function formatBuilding(): FeatureCollection {
    const features: Feature[] = [];

    if (point) {
      features.push({
        type: 'Feature',
        properties: { type: 'point' },
        geometry: {
          type: 'Point',
          coordinates: point.coordinates,
        },
      } as Feature<Point>);
    }

    if (shape) {
      features.push({
        type: 'Feature',
        properties: { type: 'polygon' },
        geometry: shape,
      });
    }
    return {
      type: 'FeatureCollection',
      features,
    };
  }
  // Layer styles
  const polygonLayer: LayerProps = {
    id: 'building-polygon',
    type: 'fill',
    filter: ['==', ['get', 'type'], 'polygon'],
    paint: {
      'fill-color': '#1452e3',
      'fill-opacity': 0,
    },
  };

  const polygonOutlineLayer: LayerProps = {
    id: 'building-polygon-outline',
    type: 'line',
    filter: ['==', ['get', 'type'], 'polygon'],
    paint: {
      'line-color': '#1452e3',
      'line-width': 2,
    },
  };

  const pointLayer: LayerProps = {
    id: 'building-point',
    type: 'circle',
    filter: ['==', ['get', 'type'], 'point'],
    paint: {
      'circle-color': '#1452e3',
      'circle-radius': 6,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
    },
  };

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          [mapboxgl-children] {
            display: none !important;
          }
        `,
        }}
      />
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={satellite as StyleSpecification}
        attributionControl={false}
      >
        <Source
          id="bdgtiles_shapes"
          type="vector"
          tiles={[
            `${process.env.NEXT_PUBLIC_API_BASE}/tiles/shapes/{x}/{y}/{z}.pbf?only_active_and_real=false`,
          ]}
        ></Source>
        <Source id="building-source" type="geojson" data={formatBuilding()}>
          <Layer {...polygonLayer} />
          <Layer {...polygonOutlineLayer} />
          <Layer {...pointLayer} />
        </Source>
      </Map>
    </div>
  );
};

export default VisuMapReact;
