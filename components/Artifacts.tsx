import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float, Environment, ContactShadows } from '@react-three/drei';

export const Artifacts: React.FC = () => {
  const mesh = useRef<THREE.Group>(null);
  
  // 1. LOAD THE MODEL
  // This hook downloads the file from your public folder.
  // 'nodes' contains the 3D parts, 'materials' contains the textures.
  const { scene } = useGLTF('/models/scene.glb');

  useFrame((state) => {
    if (!mesh.current) return;
    
    // 2. ANIMATION: "Look at Mouse" Physics
    const t = state.clock.getElapsedTime();
    const { pointer } = state;

    // Smoothly rotate to face the mouse (The "Game" feel)
    const targetX = pointer.y * 0.2; // Tilt up/down
    const targetY = pointer.x * 0.2; // Turn left/right
    
    // Add a slow "breathing" idle rotation
    const breathingX = Math.sin(t * 0.5) * 0.1;
    const breathingY = Math.cos(t * 0.3) * 0.1;

    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, targetX + breathingX, 0.1);
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, targetY + breathingY + Math.PI, 0.1); // +Math.PI to face forward usually
  });

  return (
    <group>
      {/* 3. LIGHTING: "Studio Lighting" for Metals 
          We use a 'preset' environment so the metal reflects a realistic city.
      */}
      <Environment preset="city" />

      {/* 4. THE HERO OBJECT */}
      <Float 
        speed={2} 
        rotationIntensity={0.2} 
        floatIntensity={0.5} 
        floatingRange={[-0.2, 0.2]} // Subtle floating
      >
        <primitive 
          ref={mesh} 
          object={scene} 
          scale={2.5} // Adjust scale based on your model size
          position={[0, -0.5, 0]} 
          rotation={[0, Math.PI, 0]}
        />
      </Float>

      {/* 5. CONTACT SHADOWS
          This adds a fake shadow underneath to ground the object.
      */}
      <ContactShadows 
        opacity={0.5} 
        scale={10} 
        blur={2} 
        far={4} 
        resolution={256} 
        color="#000000" 
      />
    </group>
  );
};

// Pre-load the model so it doesn't pop in
useGLTF.preload('/models/scene.glb');