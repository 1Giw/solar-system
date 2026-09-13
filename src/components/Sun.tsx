import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (coronaRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      coronaRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Sun core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Corona layer 1 */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[5.8, 64, 64]} />
        <meshBasicMaterial
          color="#FF8C00"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Corona layer 2 */}
      <mesh>
        <sphereGeometry args={[6.5, 64, 64]} />
        <meshBasicMaterial
          color="#FF6B00"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial
          color="#FF4500"
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Point lights from the sun */}
      <pointLight color="#FDB813" intensity={4} distance={500} decay={0.5} />
      <pointLight color="#FF8C00" intensity={2} distance={300} decay={1} />
      <pointLight color="#FF6B00" intensity={1} distance={200} decay={1.5} />
    </group>
  );
}
