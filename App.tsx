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
// Note: This imports from the component file you just checked in Step 1
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

// CAMERA RIG (Responsive)
const Rig: React.FC<{ started: boolean }> = ({ started }) => {
  const { camera, pointer, size } = useThree();
  
  // DETECT MOBILE: If width is less than 768px
  const isMobile = size.width < 768;

  useFrame((state) => {
    // Zoom Logic: If Mobile, move back further (z=6 or 7)
    // If Desktop, standard z=5 (intro) or z=1 (spine)
    const baseZ = isMobile ? 7.5 : 5;
    const activeZ = isMobile ? 6 : 1;
    
    const targetZ = started ? activeZ : baseZ;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.02);

    // Mouse Parallax (Reduced on mobile to prevent dizziness)
    if (started) {
        const parallaxStrength = isMobile ? 0.05 : 0.2;
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
  const lastScrollTime = useRef(0);

  // Scroll Handler
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

        {/* REGISTRATION FORM OVERLAY */}
        {showRegister && activeEvent && (
            <RegistrationForm 
                event={activeEvent}
                onClose={() => setShowRegister(false)}
                onProceedToPayment={(formData) => {
                    console.log("Form Data:", formData);
                    
                    // 1. CALCULATE AMOUNT (e.g., ₹500 per person)
                    const pricePerPerson = 500;
                    const totalAmount = formData.teamSize * pricePerPerson;

                    // 2. DEFINE RAZORPAY OPTIONS
                    const options = {
                        key: "rzp_test_S89w7SL0sxpKCl", // 🔴 REPLACE THIS LATER
                        amount: totalAmount * 100, // Amount is in PAISE (50000 = ₹500)
                        currency: "INR",
                        name: "FeWW Events", // Company Name
                        description: `Entry Fee for ${activeEvent.title}`,
                        image: "https://example.com/your_logo.png", // Optional: Add your logo URL here
                        
                        // PRE-FILL USER DATA (So they don't type it twice)
                        prefill: {
                            name: formData.teamSize > 1 ? formData.members[0].name : formData.members[0].name,
                            email: formData.members[0].email,
                            contact: formData.members[0].phone
                        },

                        theme: {
                            color: activeEvent.color // Matches the event neon color!
                        },

                        // 3. SUCCESS HANDLER
                        handler: function (response: any) {
                            console.log("PAYMENT SUCCESS!", response);
                            audioManager.playClick(); // Or a success sound
                            
                            // CLOSE FORM & SHOW SUCCESS
                            setShowRegister(false);
                            alert(`PAYMENT SUCCESSFUL!\nPayment ID: ${response.razorpay_payment_id}`);
                            // TODO: Send this ID to your database to save the registration
                        }
                    };

                    // 4. OPEN THE GATEWAY
                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                    
                    // Handle Failure (User closes window)
                    rzp.on('payment.failed', function (response: any){
                        alert("Payment Failed: " + response.error.description);
                    });
                }}
            />
        )}
      </AnimatePresence>

      <div className="relative w-full h-full bg-black">
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
              
              // NEW: Handlers for Form
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