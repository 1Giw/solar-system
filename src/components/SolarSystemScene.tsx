import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { Orbit } from './Orbit';

export interface PlanetData {
  name: string;
  radius: number;
  orbitRadius: number;
  color: string;
  realDiameter: string;
  realDistance: string;
  orbitalPeriod: string;
  speed: number;
  description: string;
  hasRings?: boolean;
  moons?: number;
}

export const PLANETS: PlanetData[] = [
  {
    name: 'Mercury',
    radius: 0.5,
    orbitRadius: 12,
    color: '#b5b5b5',
    realDiameter: '4,879 km',
    realDistance: '57.9 million km',
    orbitalPeriod: '88 days',
    speed: 4.15,
    moons: 0,
    description: 'The smallest planet and closest to the Sun. Surface temperatures range from -180°C to 430°C.',
  },
  {
    name: 'Venus',
    radius: 0.9,
    orbitRadius: 18,
    color: '#e8cda0',
    realDiameter: '12,104 km',
    realDistance: '108.2 million km',
    orbitalPeriod: '225 days',
    speed: 1.62,
    moons: 0,
    description: 'The hottest planet with a thick toxic atmosphere of CO₂. It rotates backwards compared to most planets.',
  },
  {
    name: 'Earth',
    radius: 1.0,
    orbitRadius: 25,
    color: '#4da6ff',
    realDiameter: '12,756 km',
    realDistance: '149.6 million km',
    orbitalPeriod: '365.25 days',
    speed: 1.0,
    moons: 1,
    description: 'Our home planet! The only known planet with liquid water on its surface and confirmed life.',
  },
  {
    name: 'Mars',
    radius: 0.7,
    orbitRadius: 33,
    color: '#e04a2f',
    realDiameter: '6,792 km',
    realDistance: '227.9 million km',
    orbitalPeriod: '687 days',
    speed: 0.53,
    moons: 2,
    description: 'The Red Planet with the tallest volcano (Olympus Mons - 21.9 km) and deepest canyon in the solar system.',
  },
  {
    name: 'Jupiter',
    radius: 3.0,
    orbitRadius: 50,
    color: '#c88b3a',
    realDiameter: '142,984 km',
    realDistance: '778.6 million km',
    orbitalPeriod: '11.86 years',
    speed: 0.084,
    moons: 95,
    description: 'The largest planet. Its Great Red Spot is a storm larger than Earth that has raged for centuries.',
  },
  {
    name: 'Saturn',
    radius: 2.5,
    orbitRadius: 68,
    color: '#e8d590',
    realDiameter: '120,536 km',
    realDistance: '1,433.5 million km',
    orbitalPeriod: '29.46 years',
    speed: 0.034,
    hasRings: true,
    moons: 146,
    description: 'Famous for its stunning ring system made of ice and rock particles. It is the least dense planet.',
  },
  {
    name: 'Uranus',
    radius: 1.7,
    orbitRadius: 85,
    color: '#7de8e8',
    realDiameter: '51,118 km',
    realDistance: '2,872.5 million km',
    orbitalPeriod: '84.01 years',
    speed: 0.012,
    moons: 28,
    description: 'An ice giant that rotates on its side (98° tilt). Blue-green color comes from methane in its atmosphere.',
  },
  {
    name: 'Neptune',
    radius: 1.6,
    orbitRadius: 100,
    color: '#3f54ba',
    realDiameter: '49,528 km',
    realDistance: '4,495.1 million km',
    orbitalPeriod: '164.8 years',
    speed: 0.006,
    moons: 16,
    description: 'The windiest planet with speeds up to 2,100 km/h. Deep blue color and the farthest planet from the Sun.',
  },
];

interface SceneProps {
  isPlaying: boolean;
  speedMultiplier: number;
  selectedPlanet: string | null;
  hoveredPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
  onHoverPlanet: (name: string | null) => void;
}

function Scene({
  isPlaying,
  speedMultiplier,
  selectedPlanet,
  hoveredPlanet,
  onSelectPlanet,
  onHoverPlanet,
}: SceneProps) {
  const angleRefs = useRef<React.MutableRefObject<number>[]>(
    PLANETS.map(() => ({ current: Math.random() * Math.PI * 2 }))
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.08} />

      {/* Stars background */}
      <Stars
        radius={300}
        depth={100}
        count={8000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Sun */}
      <Sun />

      {/* Orbits and Planets */}
      {PLANETS.map((planet, i) => (
        <group key={planet.name}>
          <Orbit
            radius={planet.orbitRadius}
            isHighlighted={selectedPlanet === planet.name || hoveredPlanet === planet.name}
          />
          <Planet
            name={planet.name}
            radius={planet.radius}
            orbitRadius={planet.orbitRadius}
            color={planet.color}
            speed={planet.speed}
            isPlaying={isPlaying}
            speedMultiplier={speedMultiplier}
            onSelect={() => onSelectPlanet(planet.name)}
            isSelected={selectedPlanet === planet.name}
            isHovered={hoveredPlanet === planet.name}
            onHover={(h) => onHoverPlanet(h ? planet.name : null)}
            angleRef={angleRefs.current[i]}
            hasRings={planet.hasRings}
          />
        </group>
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={15}
        maxDistance={250}
        autoRotate={false}
        makeDefault
      />
    </>
  );
}

interface SolarSystemSceneProps {
  isPlaying: boolean;
  speedMultiplier: number;
  selectedPlanet: string | null;
  hoveredPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
  onHoverPlanet: (name: string | null) => void;
}

export default function SolarSystemScene({
  isPlaying,
  speedMultiplier,
  selectedPlanet,
  hoveredPlanet,
  onSelectPlanet,
  onHoverPlanet,
}: SolarSystemSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 60, 90], fov: 55, near: 0.1, far: 1000 }}
      style={{ background: '#050510' }}
      onClick={() => {
        // Deselect when clicking empty space
      }}
      gl={{ antialias: true }}
    >
      <Scene
        isPlaying={isPlaying}
        speedMultiplier={speedMultiplier}
        selectedPlanet={selectedPlanet}
        hoveredPlanet={hoveredPlanet}
        onSelectPlanet={onSelectPlanet}
        onHoverPlanet={onHoverPlanet}
      />
    </Canvas>
  );
}
