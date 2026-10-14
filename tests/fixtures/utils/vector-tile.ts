/**
 * Minimal Mapbox Vector Tile encoder, points only, one `default` layer: the
 * layer name every RNB API tile uses. Enough to render real features in e2e,
 * where `HttpMocker` otherwise answers every `.pbf` with an empty buffer.
 */

export type TilePoint = {
  lng: number;
  lat: number;
  properties: Record<string, string | number>;
};

const EXTENT = 4096;
const WIRE_VARINT = 0;
const WIRE_LENGTH_DELIMITED = 2;
const MOVE_TO_ONE_POINT = 9;
const POINT_GEOMETRY = 1;

const varint = (value: number): number[] => {
  const bytes: number[] = [];
  let rest = value;
  while (rest > 0x7f) {
    bytes.push((rest & 0x7f) | 0x80);
    rest >>>= 7;
  }
  bytes.push(rest);
  return bytes;
};

const zigzag = (value: number) => (value << 1) ^ (value >> 31);

const varintField = ({ field, value }: { field: number; value: number }) => [
  ...varint((field << 3) | WIRE_VARINT),
  ...varint(value),
];

const bytesField = ({ field, bytes }: { field: number; bytes: number[] }) => [
  ...varint((field << 3) | WIRE_LENGTH_DELIMITED),
  ...varint(bytes.length),
  ...bytes,
];

const stringField = ({ field, value }: { field: number; value: string }) =>
  bytesField({ field, bytes: Array.from(Buffer.from(value, 'utf8')) });

const encodeValue = (value: string | number) => {
  if (typeof value === 'string') return stringField({ field: 1, value });
  // Encoded as uint_value: anything else would be silently corrupted
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Unsupported tile property value: ${value}`);
  }
  return varintField({ field: 5, value });
};

// Web Mercator position of the point inside tile x/y/z, in tile units
const toTileCoordinates = ({
  point,
  x,
  y,
  z,
}: {
  point: TilePoint;
  x: number;
  y: number;
  z: number;
}) => {
  const tileCount = 2 ** z;
  const latRad = (point.lat * Math.PI) / 180;
  const worldX = ((point.lng + 180) / 360) * tileCount;
  const worldY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    tileCount;
  return {
    tileX: Math.floor((worldX - x) * EXTENT),
    tileY: Math.floor((worldY - y) * EXTENT),
  };
};

const isInsideTile = ({ tileX, tileY }: { tileX: number; tileY: number }) =>
  tileX >= 0 && tileX < EXTENT && tileY >= 0 && tileY < EXTENT;

export const encodePointTile = ({
  points,
  x,
  y,
  z,
}: {
  points: TilePoint[];
  x: number;
  y: number;
  z: number;
}): Buffer => {
  const keys: string[] = [];
  const values: (string | number)[] = [];

  const features = points.flatMap((point) => {
    const coordinates = toTileCoordinates({ point, x, y, z });
    if (!isInsideTile(coordinates)) return [];

    const tags = Object.entries(point.properties).flatMap(([key, value]) => {
      keys.push(key);
      values.push(value);
      return [keys.length - 1, values.length - 1];
    });
    const geometry = [
      MOVE_TO_ONE_POINT,
      zigzag(coordinates.tileX),
      zigzag(coordinates.tileY),
    ];

    return bytesField({
      field: 2,
      bytes: [
        ...bytesField({ field: 2, bytes: tags.flatMap(varint) }),
        ...varintField({ field: 3, value: POINT_GEOMETRY }),
        ...bytesField({ field: 4, bytes: geometry.flatMap(varint) }),
      ],
    });
  });

  const layer = [
    ...varintField({ field: 15, value: 2 }),
    ...stringField({ field: 1, value: 'default' }),
    ...features,
    ...keys.flatMap((key) => stringField({ field: 3, value: key })),
    ...values.flatMap((value) =>
      bytesField({ field: 4, bytes: encodeValue(value) }),
    ),
    ...varintField({ field: 5, value: EXTENT }),
  ];

  return Buffer.from(bytesField({ field: 3, bytes: layer }));
};
