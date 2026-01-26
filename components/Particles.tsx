import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const Particles: React.FC = () => {
  const count = 2000;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  // 1. Memoize the dummy object to prevent garbage collection churn
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // 2. Generate random initial data
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 10 - 2;
        
        const speed = 0.002 + Math.random() * 0.005;
        const factor = 0.5 + Math.random() * 1.5;
        const time = Math.random() * 100;
        
        temp.push({ x, y, z, originalZ: z, speed, factor, time });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.forEach((p, i) => {
        // Vertical Drift
        p.y += p.speed;
        p.time += 0.01;
        
        // Loop particles (Infinite scroll effect)
        if (p.y > 10) p.y = -10;
        
        // Organic Wiggle
        const wiggleX = Math.sin(p.time * 0.5) * 0.2;
        const wiggleZ = Math.cos(p.time * 0.3) * 0.1;

        // Update Matrix
        dummy.position.set(p.x + wiggleX, p.y, p.z + wiggleZ);
        dummy.scale.setScalar(p.factor);
        dummy.updateMatrix();
        
        mesh.current.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    // FIX: Use [undefined, undefined, count] instead of null to let Three.js create default BufferGeometry/Material
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
};