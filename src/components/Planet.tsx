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
}

export function Planet({
  name,
  radius,
  orbitRadius,
  color,
  speed,
  isPlaying,
  speedMultiplier,
  onSelect,
  isSelected,
  isHovered,
  onHover,
  angleRef,
  hasRings,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Move useMemo OUTSIDE conditional rendering
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
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const scale = isSelected || isHovered ? 1.3 : 1;

  return (
    <group ref={groupRef}>
      {/* Selection/hover glow */}
      {(isSelected || isHovered) && (
        <mesh ref={glowRef} scale={scale * 1.5}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#ffff66' : '#ffffff'}
            transparent
            opacity={0.15}
          />
        </mesh>
      )}

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
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Saturn's rings */}
      {hasRings && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]} scale={scale}>
          <ringGeometry args={[radius * 1.4, radius * 2.2, 64]} />
          <meshStandardMaterial
            color="#d4b876"
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
            roughness={0.8}
          />
        </mesh>
      )}

      {/* Planet name label - now uses pre-computed texture */}
      {(isHovered || isSelected) && (
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
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
