import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedGlobe = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 100]} scale={2.2}>
      <MeshDistortMaterial
        color="#00c8ff"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        emissive="#0080ff"
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
};

const GlobeScene = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-30">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00ffff" />
        <AnimatedGlobe />
      </Canvas>
    </div>
  );
};

export default GlobeScene;
