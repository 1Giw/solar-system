import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSunTexture } from '../utils/textures';

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  const sunTexture = useMemo(() => createSunTexture(), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (coronaRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      coronaRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Sun core with texture */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>

      {/* Corona layer 1 */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[5.6, 64, 64]} />
        <meshBasicMaterial
          color="#FF8C00"
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Corona layer 2 */}
      <mesh>
        <sphereGeometry args={[6.2, 64, 64]} />
        <meshBasicMaterial
          color="#FF6B00"
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[7.5, 64, 64]} />
        <meshBasicMaterial
          color="#FF4500"
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Point lights from the sun */}
      <pointLight color="#FDB813" intensity={4} distance={500} decay={0.5} />
      <pointLight color="#FF8C00" intensity={2} distance={300} decay={1} />
      <pointLight color="#FF6B00" intensity={1} distance={200} decay={1.5} />
    </group>
  );
}
