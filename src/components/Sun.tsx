import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Sun core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[5.5, 64, 64]} />
        <meshBasicMaterial
          color="#FF8C00"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[7, 64, 64]} />
        <meshBasicMaterial
          color="#FF4500"
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Point light from the sun */}
      <pointLight color="#FDB813" intensity={3} distance={500} decay={0.5} />
      <pointLight color="#FF8C00" intensity={1.5} distance={300} decay={1} />
    </group>
  );
}
