'use client';

import { useState } from 'react';
import Medal, { MedalColor } from '@/components/games/summerGames/Medal';

const MEDALS: { image: string; label: string }[] = [
  { image: '/images/trophies/validateur.png', label: 'Validateur' },
  { image: '/images/trophies/course_de_fond.png', label: 'Course de fond' },
  { image: '/images/trophies/superv.png', label: 'Superviseur' },
  { image: '/images/trophies/tour_de_france.png', label: 'Tour de France' },
];

const COLORS: MedalColor[] = ['bronze', 'silver', 'gold', 'neutral'];

export default function MedaillesPage() {
  const [color, setColor] = useState<MedalColor>('gold');
  const [size, setSize] = useState(240);

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <h1>Médailles</h1>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          alignItems: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          Finition
          <select
            value={color}
            onChange={(e) => setColor(e.target.value as MedalColor)}
          >
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          Taille : {size}px
          <input
            type="range"
            min={80}
            max={340}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3rem',
          alignItems: 'flex-end',
        }}
      >
        {MEDALS.map((medal) => (
          <div
            key={medal.image}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <Medal
              color={color}
              image={medal.image}
              size={size}
              alt={medal.label}
            />
            <span style={{ fontWeight: 600 }}>{medal.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
