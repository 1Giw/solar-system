import { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { Orbit } from './Orbit';
import {
  loadSolarTexturesAsync,
  GeneratedTextures,
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
    radius: 0.6,
    orbitRadius: 12,
    color: '#8c7853',
    realDiameter: '4,879 km',
    realDistance: '57.9 million km',
    orbitalPeriod: '88 days',
    speed: 4.15,
    moons: 0,
    description: 'The smallest planet and closest to the Sun. Its surface is covered in craters like our Moon. Temperatures swing wildly from -180°C at night to 430°C during the day.',
    funFact: 'A year on Mercury is just 88 Earth days, but a single day lasts 59 Earth days!',
  },
  {
    name: 'Venus',
    radius: 0.95,
    orbitRadius: 18,
    color: '#c9a867',
    realDiameter: '12,104 km',
    realDistance: '108.2 million km',
    orbitalPeriod: '225 days',
    speed: 1.62,
    moons: 0,
    description: 'The hottest planet in our solar system with surface temperatures of 465°C. Its thick atmosphere of CO₂ creates a runaway greenhouse effect.',
    funFact: 'Venus rotates backwards and a day there is longer than its year!',
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
    description: 'Our beautiful home planet! The only known world with liquid water on its surface and confirmed life. 71% of the surface is covered by oceans.',
    funFact: 'Earth is the only planet not named after a Greek or Roman god!',
  },
  {
    name: 'Mars',
    radius: 0.75,
    orbitRadius: 33,
    color: '#c1440e',
    realDiameter: '6,792 km',
    realDistance: '227.9 million km',
    orbitalPeriod: '687 days',
    speed: 0.53,
    moons: 2,
    description: 'The Red Planet, colored by iron oxide (rust) on its surface. Home to Olympus Mons, the tallest volcano in the solar system (21.9 km high).',
    funFact: 'Mars has two small moons named Phobos and Deimos, meaning "Fear" and "Terror".',
  },
  {
    name: 'Jupiter',
    radius: 2.8,
    orbitRadius: 48,
    color: '#c88b3a',
    realDiameter: '142,984 km',
    realDistance: '778.6 million km',
    orbitalPeriod: '11.86 years',
    speed: 0.084,
    moons: 95,
    description: 'The king of planets! Jupiter is so massive that all other planets could fit inside it. Its Great Red Spot is a giant storm larger than Earth.',
    funFact: 'Jupiter has the shortest day of all planets - it rotates once every 10 hours!',
  },
  {
    name: 'Saturn',
    radius: 2.3,
    orbitRadius: 65,
    color: '#e8c880',
    realDiameter: '120,536 km',
    realDistance: '1,433.5 million km',
    orbitalPeriod: '29.46 years',
    speed: 0.034,
    hasRings: true,
    moons: 146,
    description: 'The jewel of the solar system with its spectacular ring system made of billions of ice and rock particles. Saturn is so light it would float in water!',
    funFact: 'Saturn\'s rings are only about 10 meters thick but stretch 282,000 km from the planet!',
  },
  {
    name: 'Uranus',
    radius: 1.6,
    orbitRadius: 82,
    color: '#73c6d6',
    realDiameter: '51,118 km',
    realDistance: '2,872.5 million km',
    orbitalPeriod: '84.01 years',
    speed: 0.012,
    hasRings: true,
    moons: 28,
    description: 'The ice giant that rotates on its side with a 98° tilt. Its blue-green color comes from methane in the atmosphere.',
    funFact: 'Uranus was the first planet discovered using a telescope, in 1781.',
  },
  {
    name: 'Neptune',
    radius: 1.5,
    orbitRadius: 96,
    color: '#3742fa',
    realDiameter: '49,528 km',
    realDistance: '4,495.1 million km',
    orbitalPeriod: '164.8 years',
    speed: 0.006,
    moons: 16,
    description: 'The windiest planet with supersonic winds reaching 2,100 km/h. Neptune\'s deep blue color comes from methane.',
    funFact: 'Neptune was predicted to exist mathematically before it was observed!',
  },
];

interface SceneProps {
  isPlaying: boolean;
  speedMultiplier: number;
  selectedPlanet: string | null;
  hoveredPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
  onHoverPlanet: (name: string | null) => void;
  showLabels: boolean;
  showOrbits: boolean;
  cameraTarget: string | null;
}

function Scene({
  isPlaying,
  speedMultiplier,
  selectedPlanet,
  hoveredPlanet,
  onSelectPlanet,
  onHoverPlanet,
  showLabels,
  showOrbits,
  cameraTarget,
}: SceneProps) {
  const angleRefs = useRef<React.MutableRefObject<number>[]>(
    PLANETS.map(() => ({ current: Math.random() * Math.PI * 2 }))
  );

  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  const targetLookAtRef = useRef<THREE.Vector3 | null>(null);
  const isTransitioning = useRef(false);

  const [solarTextures, setSolarTextures] = useState<GeneratedTextures | null>(null);

  useEffect(() => {
    let isMounted = true;
    loadSolarTexturesAsync().then((loaded) => {
      if (isMounted) {
        setSolarTextures(loaded);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!solarTextures) {
    return null;
  }

  const { textures, bumpMaps, cloudTexture, ringTextures } = solarTextures;

  // Smooth camera interpolation & orbit tracking
  useFrame(() => {
    if (cameraTarget && cameraTarget !== 'Sun') {
      const planetIndex = PLANETS.findIndex((p) => p.name === cameraTarget);
      if (planetIndex >= 0) {
        const planet = PLANETS[planetIndex];
        const angle = angleRefs.current[planetIndex].current;
        const planetPos = new THREE.Vector3(
          Math.cos(angle) * planet.orbitRadius,
          0,
          Math.sin(angle) * planet.orbitRadius
        );

        if (isTransitioning.current && targetPosRef.current && targetLookAtRef.current) {
          // Recompute current desired target position relative to moving planet
          const dirFromSun = planetPos.clone().normalize();
          const offsetDist = planet.radius * 3.2 + (planet.hasRings ? 4.0 : 1.5);
          const heightOffset = planet.radius * 1.2 + (planet.hasRings ? 1.8 : 0.8);

          const curTargetPos = planetPos.clone().add(
            dirFromSun.multiplyScalar(offsetDist)
          ).add(new THREE.Vector3(0, heightOffset, 0));

          camera.position.lerp(curTargetPos, 0.1);
          if (controlsRef.current) {
            controlsRef.current.target.lerp(planetPos, 0.1);
            controlsRef.current.update();
          }

          if (camera.position.distanceTo(curTargetPos) < 0.2) {
            isTransitioning.current = false;
          }
        } else if (controlsRef.current && isPlaying) {
          // Keep updating OrbitControls target as planet orbits Sun
          const prevTarget = controlsRef.current.target.clone();
          const deltaMove = planetPos.clone().sub(prevTarget);
          camera.position.add(deltaMove);
          controlsRef.current.target.copy(planetPos);
          controlsRef.current.update();
        }
      }
    } else if (isTransitioning.current && targetPosRef.current && targetLookAtRef.current) {
      camera.position.lerp(targetPosRef.current, 0.1);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAtRef.current, 0.1);
        controlsRef.current.update();
      }

      if (camera.position.distanceTo(targetPosRef.current) < 0.2) {
        isTransitioning.current = false;
      }
    }
  });

  // Camera Target change trigger
  useEffect(() => {
    if (cameraTarget === 'Sun') {
      targetPosRef.current = new THREE.Vector3(0, 10, 18);
      targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
      isTransitioning.current = true;
    } else if (cameraTarget) {
      const planetIndex = PLANETS.findIndex((p) => p.name === cameraTarget);
      if (planetIndex >= 0) {
        const planet = PLANETS[planetIndex];
        const angle = angleRefs.current[planetIndex].current;
        const planetPos = new THREE.Vector3(
          Math.cos(angle) * planet.orbitRadius,
          0,
          Math.sin(angle) * planet.orbitRadius
        );

        const dirFromSun = planetPos.clone().normalize();
        const offsetDist = planet.radius * 3.2 + (planet.hasRings ? 4.0 : 1.5);
        const heightOffset = planet.radius * 1.2 + (planet.hasRings ? 1.8 : 0.8);

        targetPosRef.current = planetPos.clone().add(
          dirFromSun.multiplyScalar(offsetDist)
        ).add(new THREE.Vector3(0, heightOffset, 0));

        targetLookAtRef.current = planetPos.clone();
        isTransitioning.current = true;
      }
    } else {
      // General solar system overview
      targetPosRef.current = new THREE.Vector3(0, 65, 100);
      targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
      isTransitioning.current = true;
    }
  }, [cameraTarget]);

  return (
    <>
      <ambientLight intensity={0.25} />

      <Stars
        radius={300}
        depth={100}
        count={12000}
        factor={6}
        saturation={0.5}
        fade
        speed={0.4}
      />

      <Sun />

      {PLANETS.map((planet, i) => (
        <group key={planet.name}>
          {showOrbits && (
            <Orbit
              radius={planet.orbitRadius}
              isHighlighted={selectedPlanet === planet.name || hoveredPlanet === planet.name}
            />
          )}
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
            bumpMap={bumpMaps[planet.name as keyof typeof bumpMaps]}
            cloudTexture={planet.name === 'Earth' ? cloudTexture : undefined}
            ringTexture={ringTextures[planet.name as keyof typeof ringTextures]}
            showLabel={showLabels}
          />
        </group>
      ))}

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={280}
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
  showLabels: boolean;
  showOrbits: boolean;
  cameraTarget: string | null;
}

export default function SolarSystemScene({
  isPlaying,
  speedMultiplier,
  selectedPlanet,
  hoveredPlanet,
  onSelectPlanet,
  onHoverPlanet,
  showLabels,
  showOrbits,
  cameraTarget,
}: SolarSystemSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 65, 100], fov: 50, near: 0.1, far: 1000 }}
      style={{ background: '#02040a' }}
      gl={{ antialias: true, alpha: false }}
    >
      <Scene
        isPlaying={isPlaying}
        speedMultiplier={speedMultiplier}
        selectedPlanet={selectedPlanet}
        hoveredPlanet={hoveredPlanet}
        onSelectPlanet={onSelectPlanet}
        onHoverPlanet={onHoverPlanet}
        showLabels={showLabels}
        showOrbits={showOrbits}
        cameraTarget={cameraTarget}
      />
    </Canvas>
  );
}
