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
  showLabel?: boolean;
}

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
  showLabel = false,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const textTexture = useMemo(() => createTextTexture(name), [name]);

  useFrame((_, delta) => {
    if (isPlaying) {
      angleRef.current += speed * speedMultiplier * delta * 0.3;
    }

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      groupRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;
    }

    if (meshRef.current) {
      // Different rotation speeds for different planets
      const rotSpeed = name === 'Venus' ? -0.1 : 0.5; // Venus rotates backwards
      meshRef.current.rotation.y += delta * rotSpeed;
    }

    // Clouds rotate slightly faster than planet
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.6;
    }
  });

  const scale = isSelected || isHovered ? 1.3 : 1;

  return (
    <group ref={groupRef}>
      {/* Planet body with texture */}
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
            roughness={0.8}
            metalness={0.1}
          />
        ) : (
          <meshStandardMaterial
            color="#888888"
            roughness={0.8}
            metalness={0.1}
          />
        )}
      </mesh>

      {/* Cloud layer for Earth */}
      {name === 'Earth' && (
        <mesh ref={cloudsRef} scale={scale * 1.02}>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            transparent
            opacity={0.3}
            color="#ffffff"
            roughness={1}
          />
        </mesh>
      )}

      {/* Atmosphere glow */}
      {(name === 'Earth' || name === 'Venus') && (
        <mesh scale={scale * 1.08}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial
            color={name === 'Earth' ? '#4b9fff' : '#ffcc66'}
            transparent
            opacity={0.12}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Selection/hover glow */}
      {(isSelected || isHovered) && (
        <mesh scale={scale * 1.35}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#ffd700' : '#ffffff'}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Saturn's rings with texture */}
      {hasRings && (
        <group rotation={[Math.PI / 2.5, 0, 0]} scale={scale}>
          <mesh>
            <ringGeometry args={[radius * 1.4, radius * 2.3, 128]} />
            <meshStandardMaterial
              color="#d4b876"
              side={THREE.DoubleSide}
              transparent
              opacity={0.75}
              roughness={0.9}
            />
          </mesh>
          {/* Ring shadow/detail layer */}
          <mesh>
            <ringGeometry args={[radius * 1.45, radius * 2.25, 128]} />
            <meshBasicMaterial
              color="#8b7355"
              side={THREE.DoubleSide}
              transparent
              opacity={0.2}
            />
          </mesh>
        </group>
      )}

      {/* Planet name label - always visible if showLabel, or when hovered/selected */}
      {(showLabel || isHovered || isSelected) && (
        <sprite position={[0, radius + 1.5, 0]} scale={[4, 1, 1]}>
          <spriteMaterial
            map={textTexture}
            transparent
          />
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

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, 256, 64);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 252, 60);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
