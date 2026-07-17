import React from 'react';

export type MedalColor = 'bronze' | 'silver' | 'gold' | 'neutral';

interface MedalPalette {
  /** Conic-gradient stops that give the brushed-metal ring its sheen. */
  gradient: string;
  /** Solid outer keyline colour. */
  outerRing: string;
  /** Inner highlight of the outer ring (subtle top rim light). */
  outerHighlight: string;
  /** Keyline colour between the ring and the image. */
  innerRing: string;
}

const PALETTES: Record<MedalColor, MedalPalette> = {
  bronze: {
    gradient:
      'from 0deg,#7a3d1d,#c98a5a,#b3672d,#5c2e15,#cf9660,#a8541f,#3d1e0e,#c98a5a,#b3672d,#7a3d1d,#cf9660,#5c2e15,#7a3d1d',
    outerRing: '#2a1409',
    outerHighlight: 'rgba(255,220,180,.18)',
    innerRing: '#8a4a22',
  },
  silver: {
    gradient:
      'from 0deg,#6f747a,#c4c9ce,#a4aab0,#4a4e54,#cdd2d6,#9aa0a7,#33363b,#c4c9ce,#a4aab0,#6f747a,#cdd2d6,#4a4e54,#6f747a',
    outerRing: '#23262a',
    outerHighlight: 'rgba(255,255,255,.22)',
    innerRing: '#868c92',
  },
  gold: {
    gradient:
      'from 0deg,#8a5e12,#dcbb63,#c69a2c,#6b4610,#e2c477,#c48a1e,#4a3208,#dcbb63,#c69a2c,#8a5e12,#e2c477,#6b4610,#8a5e12',
    outerRing: '#2e2005',
    outerHighlight: 'rgba(255,244,200,.25)',
    innerRing: '#b3861f',
  },
  neutral: {
    gradient:
      'from 0deg,#b3a892,#d8cdb8,#c2b6a0,#a1957e,#e0d6c2,#b3a892,#948872,#d8cdb8,#c2b6a0,#b3a892,#e0d6c2,#a1957e,#b3a892',
    outerRing: '#6b5f4c',
    outerHighlight: 'rgba(255,250,240,.16)',
    innerRing: '#c9bda6',
  },
};

interface MedalProps {
  /** Metallic finish of the ring. */
  color: MedalColor;
  /** Source of the image shown inside the medal (cover-fitted). */
  image: string;
  /** Outer diameter in pixels. */
  size: number;
  /** Alt text for the inner image. */
  alt?: string;
}

/**
 * A circular metallic medal: a conic-gradient ring framing a cover-fitted image.
 * Every structural measure (padding, keylines, shadows) scales from `size`, so
 * the medal keeps its proportions at any diameter.
 */
const Medal: React.FC<MedalProps> = ({ color, image, size, alt = '' }) => {
  const palette = PALETTES[color];

  const ring = Math.max(1, Math.round(size / 170));
  const padding = Math.round(size * 0.065);
  const innerBlur = Math.max(3, Math.round(size * 0.018));

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        padding,
        boxSizing: 'border-box',
        background: `conic-gradient(${palette.gradient})`,
        boxShadow: `0 0 0 ${ring}px ${palette.outerRing}, inset 0 0 0 ${ring}px ${palette.outerHighlight}`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: `inset 0 0 0 ${ring}px ${palette.innerRing}, inset 0 1px ${innerBlur}px rgba(0,0,0,.3)`,
          background: '#0d0f13',
        }}
      >
        <img
          src={image}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
};

export default Medal;
