import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSunTexture } from '../utils/textures';

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerCoronaRef = useRef<THREE.Mesh>(null);
  const outerCoronaRef = useRef<THREE.Mesh>(null);

  const sunTexture = useMemo(() => createSunTexture(), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0012;
    }
    if (innerCoronaRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.025;
      innerCoronaRef.current.scale.set(scale, scale, scale);
    }
    if (outerCoronaRef.current) {
      const scale = 1 + Math.cos(state.clock.elapsedTime * 1.8) * 0.04;
      outerCoronaRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Sun core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>

      {/* Dynamic Inner Corona Layer */}
      <mesh ref={innerCoronaRef}>
        <sphereGeometry args={[5.5, 64, 64]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>

      {/* Dynamic Middle Corona Layer */}
      <mesh ref={outerCoronaRef}>
        <sphereGeometry args={[6.3, 64, 64]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.18} side={THREE.BackSide} />
      </mesh>

      {/* Outer Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[7.8, 64, 64]} />
        <meshBasicMaterial color="#ff3300" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {/* Sunlight sources */}
      <pointLight color="#fff0d0" intensity={4.5} distance={600} decay={0.2} />
      <pointLight color="#ff9900" intensity={2.0} distance={300} decay={0.8} />
    </group>
  );
}
