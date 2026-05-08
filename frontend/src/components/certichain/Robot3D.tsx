"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function RobotModel() {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Follow mouse logic for head
    const mouseX = (state.mouse.x * Math.PI) / 8;
    const mouseY = (state.mouse.y * Math.PI) / 8;
    
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, mouseX, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -mouseY, 0.1);
    }

    if (groupRef.current) {
      // Subtle breathing animation for full body
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.05 - 1.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <group ref={headRef} position={[0, 2.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.25]}>
          <sphereGeometry args={[0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0} metalness={1} />
        </mesh>
        {/* Glowing Eyes */}
        <mesh position={[-0.15, 0.05, 0.35]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#00f2ff" />
        </mesh>
        <mesh position={[0.15, 0.05, 0.35]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#00f2ff" />
        </mesh>
      </group>

      {/* Torso */}
      <mesh position={[0, 1.2, 0]}>
        <capsuleGeometry args={[0.45, 1, 4, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.1} />
      </mesh>

      {/* Chest Plate (Glowing Core) */}
      <mesh position={[0, 1.5, 0.3]}>
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} />
      </mesh>

      {/* Arms */}
      <group position={[-0.6, 1.6, 0]} rotation={[0, 0, 0.2]}>
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.12, 0.8, 4, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.1} />
        </mesh>
      </group>
      <group position={[0.6, 1.6, 0]} rotation={[0, 0, -0.2]}>
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.12, 0.8, 4, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.1} />
        </mesh>
      </group>

      {/* Legs */}
      <group position={[-0.25, 0.4, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.15, 1, 4, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.1} />
        </mesh>
      </group>
      <group position={[0.25, 0.4, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.15, 1, 4, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.1} />
        </mesh>
      </group>

      {/* Hover Base Glow */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 1.5, 32]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export function Robot3D() {
  return (
    <div className="h-full w-full">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1000} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={500} color="#8b5cf6" />
        
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <RobotModel />
        </Float>

        {/* Decorative background distort sphere */}
        <Sphere args={[4, 64, 64]} position={[0, 0, -5]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            speed={2}
            distort={0.4}
            radius={1}
            opacity={0.1}
            transparent
          />
        </Sphere>
        
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
      </Canvas>
    </div>
  );
}
