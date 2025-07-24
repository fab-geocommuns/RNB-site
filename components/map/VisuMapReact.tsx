import React, { useState, useEffect } from 'react';
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
  }
  // useEffect(() => {
  //   const features: Feature[] = [];

  //   if (point) {
  //     features.push({
  //       type: 'Feature',
  //       properties: { type: 'point' },
  //       geometry: {
  //         type: 'Point',
  //         coordinates: point.coordinates,
  //       },
  //     } as Feature<Point>);
  //   }

  //   if (shape) {
  //     features.push({
  //       type: 'Feature',
  //       properties: { type: 'polygon' },
  //       geometry: {
  //         type: 'MultiPolygon',
  //         coordinates: shape.coordinates,
  //       },
  //     } as Feature<MultiPolygon>);
  //   }
  //   console.log('features', features)
  //   setBuilding({
  //     type: 'FeatureCollection',
  //     features: features
  //   })
  //   console.log('building', building)
  // }, [point, shape]);
  console.log(formatBuilding());
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
        <Source
          id="building-source"
          type="geojson"
          data={{
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  type: 'point',
                },
                geometry: {
                  type: 'Point',
                  coordinates: [2.400800129, 48.861114479],
                },
              },
              {
                type: 'Feature',
                properties: {
                  type: 'polygon',
                },
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: [
                    [
                      [
                        [2.400553942, 48.8611944],
                        [2.400534912, 48.861189808],
                        [2.400597674, 48.861066013],
                        [2.400620782, 48.861071524],
                        [2.400670552, 48.861010618],
                        [2.400757482, 48.861070939],
                        [2.400761715, 48.861024565],
                        [2.400993975, 48.861095877],
                        [2.40099952, 48.86108781],
                        [2.401036186, 48.861099685],
                        [2.401018126, 48.861129273],
                        [2.400964143, 48.86120095],
                        [2.400780794, 48.861143374],
                        [2.400753111, 48.861180108],
                        [2.400762621, 48.861182854],
                        [2.400716919, 48.861245579],
                        [2.400553942, 48.8611944],
                      ],
                    ],
                  ],
                },
              },
            ],
          }}
        >
          <Layer {...polygonLayer} />
          <Layer {...polygonOutlineLayer} />
          <Layer {...pointLayer} />
        </Source>
      </Map>
    </div>
  );
};

export default VisuMapReact;
