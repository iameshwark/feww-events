import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'; 
import * as THREE from 'three';

// COMPONENT IMPORTS
import { FluidBackground } from './components/FluidBackground';
import { Particles } from './components/Particles';
import { Artifacts } from './components/Artifacts';
import { Overlay } from './components/Overlay';
import { RegistrationForm } from './components/RegistrationForm'; 
import { MembershipModal } from './components/MembershipModal'; 
import { audioManager } from './utils/AudioManager';

// TYPES
export type AppState = 'intro' | 'spine' | 'detail';

export type EventData = {
  id: number;
  title: string;
  color: string;
  desc: string;
  date: string;
};

// DATA
const EVENTS: EventData[] = [
  { 
    id: 1, 
    title: "PROTOCOL 0", 
    color: "#ff3333", 
    desc: "FEB 7 // 2026. The 2 PIECE prologue. An exclusive, 40-person invite-only interactive lore hunt. The signal has been established. Only the chosen few will breach the firewall and witness the beginning. Access Restricted.", 
    date: "FEB 7 // 2026" 
  },
  { 
    id: 2, 
    // 🟢 RENAMED: XXX -> UNDYED
    title: "UNDYED", 
    color: "#d946ef", 
    desc: "A Holi celebration twisted by a biochemical outbreak. The containment field has failed. ZOMBIE INVASION IMMINENT. Navigate the neon-soaked chaos, evade the infected, and survive the festival. Run. Hide. Color.", 
    date: "COMING SOON" 
  },
  { 
    id: 3, 
    title: "2 PIECE", 
    color: "#ffd700", 
    desc: "India's largest, grandest city-wide treasure hunt returns to Chennai. The first-ever experiential reality game of its scale. The city is the board, the clues are real, and the clock is ticking. Prepare for the ultimate protocol.", 
    date: "COMING SOON" 
  }
];

// CAMERA RIG
const Rig: React.FC<{ started: boolean }> = ({ started }) => {
  const { camera, pointer, size } = useThree();
  const isMobile = size.width < 768;

  useFrame((state) => {
    const baseZ = isMobile ? 8 : 5;
    const activeZ = isMobile ? 6.5 : 1;
    const targetZ = started ? activeZ : baseZ;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.02);

    if (started) {
        const parallaxStrength = isMobile ? 0.02 : 0.2;
        const targetX = pointer.x * parallaxStrength; 
        const targetY = pointer.y * parallaxStrength;
        
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
        camera.lookAt(0, 0, 0);
    }
  });
  return null;
};

// MAIN APP
const App: React.FC = () => {
  const [viewState, setViewState] = useState<AppState>('intro');
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [targetColor, setTargetColor] = useState<string>('#ffffff');
  const [started, setStarted] = useState(true);
  const [showRegister, setShowRegister] = useState(false); 
  
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0); 

  // SCROLL LOGIC
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!started || showRegister) return; 
      const now = Date.now();
      if (now - lastScrollTime.current < 1000) return;
      const threshold = 20;

      if (viewState === 'intro') {
        if (e.deltaY > threshold) {
          setViewState('spine');
          setTargetColor('#333333');
          lastScrollTime.current = now;
        }
      } else if (viewState === 'spine') {
        if (e.deltaY < -threshold) {
          setViewState('intro');
          setTargetColor('#ffffff');
          lastScrollTime.current = now;
        }
      }
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [viewState, started, showRegister]);

  // TOUCH LOGIC
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (!started || showRegister) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;
        const now = Date.now();
        if (now - lastScrollTime.current < 800) return;

        if (Math.abs(diff) > 50) {
            if (viewState === 'intro' && diff > 0) {
                setViewState('spine');
                setTargetColor('#333333');
                lastScrollTime.current = now;
            } else if (viewState === 'spine' && diff < 0) {
                setViewState('intro');
                setTargetColor('#ffffff');
                lastScrollTime.current = now;
            }
        }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [viewState, started, showRegister]);

  const activeEvent = EVENTS.find(e => e.id === activeEventId) || null;

  return (
    <>
      <AnimatePresence>
        {showRegister && activeEvent && (
            <RegistrationForm 
                event={activeEvent}
                onClose={() => setShowRegister(false)}
                onProceedToPayment={() => {}} 
            />
        )}
      </AnimatePresence>

      <div className="relative w-full h-full bg-black touch-none"> 
        <div className="absolute inset-0 z-0">
          <Canvas
            dpr={[1, 2]} 
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ 
              antialias: false, 
              alpha: true,
              powerPreference: 'high-performance'
            }} 
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1.0} />
              
              <Rig started={started} />
              
              <FluidBackground targetColor={targetColor} />
              <Artifacts />
              <Particles />

              <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.6} />
                <Noise opacity={0.05} />
                <Vignette offset={0.5} darkness={0.6} />
                <ChromaticAberration
                  offset={new THREE.Vector2(0.002, 0.002)}
                  radialModulation={false}
                  modulationOffset={0}
                />
              </EffectComposer>

            </Suspense>
          </Canvas>
        </div>
        
        {started && (
            <>
                <Overlay 
                  events={EVENTS}
                  viewState={viewState}
                  activeEvent={EVENTS.find(e => e.id === activeEventId) || null}
                  onEnterSpine={() => { setViewState('spine'); setTargetColor('#333333'); }}
                  onSelectEvent={(event) => { setActiveEventId(event.id); setViewState('detail'); setTargetColor(event.color); }}
                  onHoverEvent={(color) => { if (viewState === 'spine') setTargetColor(color); }}
                  onHoverOut={() => { if (viewState === 'spine') setTargetColor('#333333'); }}
                  onBack={() => { 
                    setViewState('spine'); 
                    setActiveEventId(null); 
                    setTargetColor('#333333');
                    setShowRegister(false);
                  }}
                  onRegisterStart={() => setShowRegister(true)}
                />
                
                <MembershipModal />
            </>
        )}
      </div>
    </>
  );
};

export default App;