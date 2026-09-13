import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetProps {
  name: string;
  radius: number;
  orbitRadius: number;
  color: string;
  speed: number;
  isPlaying: boolean;
  speedMultiplier: number;
  onSelect: () => void;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  angleRef: React.MutableRefObject<number>;
  hasRings?: boolean;
  texture?: THREE.Texture;
  bumpMap?: THREE.Texture;
  cloudTexture?: THREE.Texture;
  ringTexture?: THREE.Texture;
  showLabel?: boolean;
}

// Axial tilts in radians
const AXIAL_TILTS: Record<string, number> = {
  Mercury: (0.03 * Math.PI) / 180,
  Venus: (177.3 * Math.PI) / 180,
  Earth: (23.44 * Math.PI) / 180,
  Mars: (25.19 * Math.PI) / 180,
  Jupiter: (3.13 * Math.PI) / 180,
  Saturn: (26.73 * Math.PI) / 180,
  Uranus: (97.77 * Math.PI) / 180,
  Neptune: (28.32 * Math.PI) / 180,
};

export function Planet({
  name,
  radius,
  orbitRadius,
  speed,
  isPlaying,
  speedMultiplier,
  onSelect,
  isSelected,
  isHovered,
  onHover,
  angleRef,
  hasRings,
  texture,
  bumpMap,
  cloudTexture,
  ringTexture,
  showLabel = false,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const tiltGroupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const textTexture = useMemo(() => createTextTexture(name), [name]);
  const tilt = AXIAL_TILTS[name] || 0;

  useFrame((_, delta) => {
    if (isPlaying) {
      angleRef.current += speed * speedMultiplier * delta * 0.15;
    }

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      groupRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;
    }

    if (meshRef.current) {
      const rotSpeed = name === 'Venus' ? -0.15 : 0.4;
      meshRef.current.rotation.y += delta * rotSpeed;
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.5;
    }
  });

  const scale = isSelected || isHovered ? 1.15 : 1;

  return (
    <group ref={groupRef}>
      {/* Axial tilt container */}
      <group ref={tiltGroupRef} rotation={[0, 0, tilt]}>
        {/* Planet body */}
        <mesh
          ref={meshRef}
          scale={scale}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            onHover(false);
            document.body.style.cursor = 'default';
          }}
        >
          <sphereGeometry args={[radius, 64, 64]} />
          {texture ? (
            <meshStandardMaterial
              map={texture}
              bumpMap={bumpMap || null}
              bumpScale={name === 'Earth' ? 0.08 : 0.05}
              roughness={name === 'Earth' ? 0.45 : 0.65}
              metalness={name === 'Earth' ? 0.2 : 0.05}
            />
          ) : (
            <meshStandardMaterial
              color="#888888"
              roughness={0.8}
              metalness={0.1}
            />
          )}
        </mesh>

        {/* Dynamic clouds for Earth */}
        {name === 'Earth' && cloudTexture && (
          <mesh ref={cloudsRef} scale={scale * 1.02}>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshStandardMaterial
              map={cloudTexture}
              transparent
              opacity={0.85}
              depthWrite={false}
              roughness={0.9}
            />
          </mesh>
        )}

        {/* Atmosphere Rayleigh Horizon Glow */}
        {(name === 'Earth' || name === 'Venus' || name === 'Neptune' || name === 'Mars' || isSelected || isHovered) && (
          <mesh scale={scale * (isSelected ? 1.16 : 1.06)}>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshBasicMaterial
              color={
                name === 'Earth' ? '#38bdf8' :
                name === 'Venus' ? '#fde047' :
                name === 'Mars' ? '#f97316' :
                name === 'Neptune' ? '#60a5fa' :
                isSelected ? '#f59e0b' : '#ffffff'
              }
              transparent
              opacity={isSelected ? 0.3 : 0.18}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Selection highlight ring/glow */}
        {(isSelected || isHovered) && (
          <mesh scale={scale * 1.3}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#38bdf8' : '#ffffff'}
              transparent
              opacity={0.12}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Rings for Saturn and Uranus */}
        {hasRings && (
          <group rotation={[Math.PI / 2, 0, 0]} scale={scale}>
            <mesh>
              <ringGeometry args={[radius * 1.35, radius * 2.3, 128]} />
              <meshStandardMaterial
                map={ringTexture || null}
                side={THREE.DoubleSide}
                transparent
                opacity={0.9}
                roughness={0.6}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* Label above planet */}
      {(showLabel || isHovered || isSelected) && (
        <sprite position={[0, radius * scale + 1.8, 0]} scale={[4.5, 1.1, 1]}>
          <spriteMaterial map={textTexture} transparent depthTest={false} />
        </sprite>
      )}
    </group>
  );
}

function createTextTexture(text: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(10, 15, 30, 0.75)';
  ctx.roundRect ? ctx.roundRect(4, 4, 248, 56, 12) : ctx.fillRect(4, 4, 248, 56);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 2;
  ctx.roundRect ? ctx.roundRect(4, 4, 248, 56, 12) : ctx.strokeRect(4, 4, 248, 56);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
