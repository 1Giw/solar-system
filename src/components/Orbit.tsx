import { useMemo } from 'react';
import { Line } from '@react-three/drei';

interface OrbitProps {
  radius: number;
  isHighlighted?: boolean;
}

export function Orbit({ radius, isHighlighted }: OrbitProps) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={isHighlighted ? '#818cf8' : '#ffffff'}
      lineWidth={isHighlighted ? 1.5 : 0.5}
      transparent
      opacity={isHighlighted ? 0.6 : 0.15}
    />
  );
}
