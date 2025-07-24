import React, { useState, useMemo, useEffect } from 'react';
import { Map, Layer, Source } from 'react-map-gl/maplibre';
import satellite from '@/components/map/mapstyles/satellite.json';
import type { LayerProps } from 'react-map-gl/maplibre';
import type { FeatureCollection, Feature, Point, MultiPolygon } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface VisuMapReactProps {
  point?: { coordinates: number[] };
  shape?: { coordinates: number[][][][] };
}

const VisuMapReact = ({ point, shape }: VisuMapReactProps) => {
  const [viewState, setViewState] = useState({
    latitude: point?.coordinates[1] || 44.820271366,
    longitude: point?.coordinates[0] || -0.572593087,
    zoom: 17,
  });

  // Remove mapboxgl-children div
  const building: FeatureCollection = useMemo(() => {
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
        geometry: {
          type: 'MultiPolygon',
          coordinates: shape.coordinates,
        },
      } as Feature<MultiPolygon>);
    }

    return {
      type: 'FeatureCollection',
      features,
    };
  }, [point, shape]);

  // Layer styles
  const polygonLayer: LayerProps = {
    id: 'building-polygon',
    type: 'fill',
    source: 'bdgtiles_shapes',
    'source-layer': 'default',
    paint: {
      'fill-color': '#1452e3',
      'fill-opacity': 1,
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
        <Source id="building-source" type="geojson" data={building}>
          <Layer {...polygonLayer} />
          <Layer {...polygonOutlineLayer} />
          <Layer {...pointLayer} />
        </Source>
      </Map>
    </div>
  );
};

export default VisuMapReact;
