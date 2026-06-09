// Background styles
import vectorOsm from '@/components/map/mapstyles/vector-osm.json';
import vectorIgnStandard from '@/components/map/mapstyles/vector-ign-standard.json';
import satellite from '@/components/map/mapstyles/satellite.json';
import satellite_2016_2020 from '@/components/map/mapstyles/satellite_2016_2020.json';

import { StyleSpecification } from 'maplibre-gl';
import { MapBackgroundLayer } from '@/stores/map/map-slice';

export const STYLES: Record<
  MapBackgroundLayer,
  { name: string; style: StyleSpecification }
> = {
  vectorOsm: {
    name: 'OSM',
    style: vectorOsm as StyleSpecification,
  },
  vectorIgnStandard: {
    name: 'IGN standard',
    style: vectorIgnStandard as StyleSpecification,
  },
  satellite: {
    name: 'Satellite',
    style: satellite as StyleSpecification,
  },
  satellite_2016_2020: {
    name: 'Satellite 2011-2016',
    style: satellite_2016_2020 as StyleSpecification,
  },
};

export const DEFAULT_STYLE =
  STYLES[
    (process.env.FOND_DE_CARTE_PAR_DEFAUT as keyof typeof STYLES) ||
      'vectorIgnStandard'
  ].style;
