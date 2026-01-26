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
import { Preloader } from './components/Preloader';
import { RegistrationForm } from './components/RegistrationForm'; 
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
    title: "RAINBOW SKY", 
    color: "#00ff00", 
    desc: "High-octane tactical paintball warfare in the underground arena. Teams fight for dominance in a neon-soaked labyrinth.", 
    date: "COMING SOON" 
  },
  { 
    id: 2, 
    title: "2 PIECE - PROTOCOL 13", 
    color: "#ff0000", 
    desc: "The influencer treasure hunt begins. 50 players. 1 Winner. A brutal test of wit and endurance streamed live to the world.", 
    date: "COMING SOON" 
  },
  { 
    id: 3, 
    title: "2 PIECE", 
    color: "#ffd700", 
    desc: "A city-wide immersive treasure hunt across Chennai. Solvers must decrypt clues hidden in physical locations.", 
    date: "DECEMBER 2026" 
  }
];

// CAMERA RIG (Mobile Optimized)
const Rig: React.FC<{ started: boolean }> = ({ started }) => {
  const { camera, pointer, size } = useThree();
  const isMobile = size.width < 768;

  useFrame((state) => {
    // 🔴 MOBILE FIX: Move camera further back (z=7.5) so text fits
    const baseZ = isMobile ? 8 : 5;
    const activeZ = isMobile ? 6.5 : 1;
    
    const targetZ = started ? activeZ : baseZ;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.02);

    if (started) {
        // 🔴 MOBILE FIX: Reduce motion sickness on phones
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
  const [started, setStarted] = useState(false);
  const [showRegister, setShowRegister] = useState(false); 
  
  // Refs for Scroll/Swipe Logic
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0); // 🔴 MOBILE FIX: Track touch start

  // 🔴 1. DESKTOP SCROLL HANDLER
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

  // 🔴 2. MOBILE SWIPE HANDLER (New Code)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (!started || showRegister) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;
        const now = Date.now();
        
        // Prevent rapid swipes
        if (now - lastScrollTime.current < 800) return;

        // Threshold for a "Swipe" (50px)
        if (Math.abs(diff) > 50) {
            if (viewState === 'intro' && diff > 0) {
                // Swiped UP -> Go to Spine
                setViewState('spine');
                setTargetColor('#333333');
                lastScrollTime.current = now;
            } else if (viewState === 'spine' && diff < 0) {
                // Swiped DOWN -> Go back to Intro
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
        {!started && (
          <Preloader onEnter={() => {
            audioManager.startAmbient();
            setStarted(true);
          }} />
        )}

        {showRegister && activeEvent && (
            <RegistrationForm 
                event={activeEvent}
                onClose={() => setShowRegister(false)}
                onProceedToPayment={(formData) => {
                    console.log("Form Data:", formData);
                    const pricePerPerson = 500;
                    const totalAmount = formData.teamSize * pricePerPerson;

                    const options = {
                        key: "rzp_test_S89w7SL0sxpKCl", 
                        amount: totalAmount * 100, 
                        currency: "INR",
                        name: "FeWW Events",
                        description: `Entry Fee for ${activeEvent.title}`,
                        prefill: {
                            name: formData.teamSize > 1 ? formData.members[0].name : formData.members[0].name,
                            email: formData.members[0].email,
                            contact: formData.members[0].phone
                        },
                        theme: { color: activeEvent.color },
                        handler: function (response: any) {
                            audioManager.playClick(); 
                            setShowRegister(false);
                            alert(`PAYMENT SUCCESSFUL!\nPayment ID: ${response.razorpay_payment_id}`);
                        }
                    };

                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                    rzp.on('payment.failed', function (response: any){
                        alert("Payment Failed: " + response.error.description);
                    });
                }}
            />
        )}
      </AnimatePresence>

      <div className="relative w-full h-full bg-black touch-none"> {/* touch-none prevents browser bounce */}
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
        )}
      </div>
    </>
  );
};

export default App;