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
  const atmosphereRef = useRef<THREE.Mesh>(null);

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

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.3;
    }
  });

  const scale = isSelected || isHovered ? 1.3 : 1;

  return (
    <group ref={groupRef}>
      {/* Atmosphere glow for Earth, Venus, Jupiter, Saturn */}
      {(name === 'Earth' || name === 'Venus' || name === 'Jupiter' || name === 'Saturn') && (
        <mesh ref={atmosphereRef} scale={scale * 1.15}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial
            color={name === 'Earth' ? '#4b7bec' : color}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Planet body with enhanced material */}
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
        <meshStandardMaterial
          color={color}
          roughness={name === 'Earth' ? 0.6 : 0.8}
          metalness={name === 'Mercury' ? 0.3 : 0.1}
          emissive={color}
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Selection/hover glow */}
      {(isSelected || isHovered) && (
        <mesh scale={scale * 1.4}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#ffd700' : '#ffffff'}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Saturn's rings - enhanced */}
      {hasRings && (
        <group rotation={[Math.PI / 2.5, 0, 0]} scale={scale}>
          {/* Inner ring */}
          <mesh>
            <ringGeometry args={[radius * 1.4, radius * 1.7, 64]} />
            <meshStandardMaterial
              color="#d4b876"
              side={THREE.DoubleSide}
              transparent
              opacity={0.8}
              roughness={0.9}
            />
          </mesh>
          {/* Middle ring */}
          <mesh>
            <ringGeometry args={[radius * 1.75, radius * 1.95, 64]} />
            <meshStandardMaterial
              color="#c9a867"
              side={THREE.DoubleSide}
              transparent
              opacity={0.6}
              roughness={0.9}
            />
          </mesh>
          {/* Outer ring */}
          <mesh>
            <ringGeometry args={[radius * 2.0, radius * 2.2, 64]} />
            <meshStandardMaterial
              color="#b89968"
              side={THREE.DoubleSide}
              transparent
              opacity={0.4}
              roughness={0.9}
            />
          </mesh>
        </group>
      )}

      {/* Planet name label */}
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
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, 256, 64);
  
  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 252, 60);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
