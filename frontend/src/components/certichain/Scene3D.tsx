import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus, Environment } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function Certificate() {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, "/certificate.png");
  
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.4;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref}>
        <boxGeometry args={[2.8, 1.8, 0.04]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </Float>
  );
}

function Orb({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere position={position} args={[0.4, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

export function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#7c5cff" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#7df9ff" />
        <Certificate />
        <Orb position={[-2.6, 1.4, -1]} color="#7df9ff" />
        <Orb position={[2.6, -1.2, -1]} color="#c77dff" />
        <Torus args={[1.8, 0.02, 16, 100]} rotation={[Math.PI / 2.5, 0, 0]}>
          <meshStandardMaterial color="#7c5cff" emissive="#7c5cff" emissiveIntensity={0.6} />
        </Torus>
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
