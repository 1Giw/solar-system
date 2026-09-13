import { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { Orbit } from './Orbit';
import {
  createMercuryTexture,
  createVenusTexture,
  createEarthTexture,
  createMarsTexture,
  createJupiterTexture,
  createSaturnTexture,
  createUranusTexture,
  createNeptuneTexture,
} from '../utils/textures';

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
  funFact: string;
  hasRings?: boolean;
  moons?: number;
}

export const PLANETS: PlanetData[] = [
  {
    name: 'Mercury',
    radius: 0.5,
    orbitRadius: 12,
    color: '#8c7853',
    realDiameter: '4,879 km',
    realDistance: '57.9 million km',
    orbitalPeriod: '88 days',
    speed: 4.15,
    moons: 0,
    description: 'The smallest planet and closest to the Sun. Its surface is covered in craters like our Moon. Temperatures swing wildly from -180°C at night to 430°C during the day. Mercury has no atmosphere to retain heat.',
    funFact: 'A year on Mercury is just 88 Earth days, but a single day lasts 59 Earth days!',
  },
  {
    name: 'Venus',
    radius: 0.9,
    orbitRadius: 18,
    color: '#c9a867',
    realDiameter: '12,104 km',
    realDistance: '108.2 million km',
    orbitalPeriod: '225 days',
    speed: 1.62,
    moons: 0,
    description: 'The hottest planet in our solar system with surface temperatures of 465°C. Its thick atmosphere of CO₂ creates a runaway greenhouse effect. Venus rotates backwards (retrograde) and a day there is longer than its year!',
    funFact: 'Venus is often called Earth\'s twin because of similar size, but conditions are hellishly different.',
  },
  {
    name: 'Earth',
    radius: 1.0,
    orbitRadius: 25,
    color: '#4b7bec',
    realDiameter: '12,756 km',
    realDistance: '149.6 million km',
    orbitalPeriod: '365.25 days',
    speed: 1.0,
    moons: 1,
    description: 'Our beautiful home planet! The only known world with liquid water on its surface and confirmed life. Earth\'s atmosphere protects us from radiation and meteors. 71% of the surface is covered by oceans.',
    funFact: 'Earth is the only planet not named after a Greek or Roman god!',
  },
  {
    name: 'Mars',
    radius: 0.7,
    orbitRadius: 33,
    color: '#c1440e',
    realDiameter: '6,792 km',
    realDistance: '227.9 million km',
    orbitalPeriod: '687 days',
    speed: 0.53,
    moons: 2,
    description: 'The Red Planet, colored by iron oxide (rust) on its surface. Home to Olympus Mons, the tallest volcano in the solar system (21.9 km high - 2.5x Mount Everest!). Also has Valles Marineris, a canyon system that would stretch across the entire United States.',
    funFact: 'Mars has two small moons named Phobos and Deimos, which mean "Fear" and "Terror" in Greek.',
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
    description: 'The king of planets! Jupiter is so massive that all other planets could fit inside it. Its Great Red Spot is a giant storm larger than Earth that has been raging for at least 350 years. Jupiter acts as a cosmic vacuum cleaner, protecting inner planets from asteroids.',
    funFact: 'Jupiter has the shortest day of all planets - it rotates once every 10 hours!',
  },
  {
    name: 'Saturn',
    radius: 2.5,
    orbitRadius: 68,
    color: '#e8c880',
    realDiameter: '120,536 km',
    realDistance: '1,433.5 million km',
    orbitalPeriod: '29.46 years',
    speed: 0.034,
    hasRings: true,
    moons: 146,
    description: 'The jewel of the solar system with its spectacular ring system made of billions of ice and rock particles. Saturn is so light it would float in water (if you could find a bathtub big enough!). Its moon Titan has lakes of liquid methane.',
    funFact: 'Saturn\'s rings are only about 10 meters thick but stretch 282,000 km from the planet!',
  },
  {
    name: 'Uranus',
    radius: 1.7,
    orbitRadius: 85,
    color: '#73c6d6',
    realDiameter: '51,118 km',
    realDistance: '2,872.5 million km',
    orbitalPeriod: '84.01 years',
    speed: 0.012,
    moons: 28,
    description: 'The ice giant that rotates on its side with a 98° tilt - possibly from an ancient collision. Its blue-green color comes from methane in the atmosphere absorbing red light. Uranus is the coldest planet despite not being the farthest from the Sun.',
    funFact: 'Uranus was the first planet discovered using a telescope, by William Herschel in 1781.',
  },
  {
    name: 'Neptune',
    radius: 1.6,
    orbitRadius: 100,
    color: '#3742fa',
    realDiameter: '49,528 km',
    realDistance: '4,495.1 million km',
    orbitalPeriod: '164.8 years',
    speed: 0.006,
    moons: 16,
    description: 'The windiest planet with supersonic winds reaching 2,100 km/h - the fastest in the solar system! Neptune\'s deep blue color comes from methane, but there\'s also an unknown component making it bluer than Uranus. It has a faint ring system discovered in 1989.',
    funFact: 'Neptune was predicted to exist mathematically before it was observed through a telescope!',
  },
];

interface SceneProps {
  isPlaying: boolean;
  speedMultiplier: number;
  selectedPlanet: string | null;
  hoveredPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
  onHoverPlanet: (name: string | null) => void;
  isDarkMode: boolean;
}

function Scene({
  isPlaying,
  speedMultiplier,
  selectedPlanet,
  hoveredPlanet,
  onSelectPlanet,
  onHoverPlanet,
  isDarkMode,
}: SceneProps) {
  const angleRefs = useRef<React.MutableRefObject<number>[]>(
    PLANETS.map(() => ({ current: Math.random() * Math.PI * 2 }))
  );

  // Generate planet textures
  const textures = useMemo(() => ({
    Mercury: createMercuryTexture(),
    Venus: createVenusTexture(),
    Earth: createEarthTexture(),
    Mars: createMarsTexture(),
    Jupiter: createJupiterTexture(),
    Saturn: createSaturnTexture(),
    Uranus: createUranusTexture(),
    Neptune: createNeptuneTexture(),
  }), []);

  return (
    <>
      {/* Lighting - brighter in day mode */}
      <ambientLight intensity={isDarkMode ? 0.15 : 0.5} />
      
      {/* Additional light for day mode */}
      {!isDarkMode && (
        <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
      )}

      {/* Stars background - only in dark mode */}
      {isDarkMode && (
        <Stars
          radius={300}
          depth={100}
          count={10000}
          factor={5}
          saturation={0.5}
          fade
          speed={0.5}
        />
      )}

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
            texture={textures[planet.name as keyof typeof textures]}
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
  isDarkMode: boolean;
}

export default function SolarSystemScene({
  isPlaying,
  speedMultiplier,
  selectedPlanet,
  hoveredPlanet,
  onSelectPlanet,
  onHoverPlanet,
  isDarkMode,
}: SolarSystemSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 60, 90], fov: 55, near: 0.1, far: 1000 }}
      style={{ background: isDarkMode ? '#050510' : 'transparent' }}
      onClick={() => {
        // Deselect when clicking empty space
      }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene
        isPlaying={isPlaying}
        speedMultiplier={speedMultiplier}
        selectedPlanet={selectedPlanet}
        hoveredPlanet={hoveredPlanet}
        onSelectPlanet={onSelectPlanet}
        onHoverPlanet={onHoverPlanet}
        isDarkMode={isDarkMode}
      />
    </Canvas>
  );
}
