import React, { Suspense, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'; 
import * as THREE from 'three';
import { supabase } from './utils/supabaseClient';
import { GridTicketsModal } from './components/GridTicketsModal';

// COMPONENT IMPORTS
import { FluidBackground } from './components/FluidBackground';
import { Particles } from './components/Particles';
import { Artifacts } from './components/Artifacts';
import { Overlay, AboutModal, ContactModal } from './components/Overlay';
import { RegistrationForm } from './components/RegistrationForm'; 
import { AuthModal } from './components/AuthModal';
import { AccountModal } from './components/AccountModal';
import { Navbar } from './components/Navbar';

// TYPES
export type AppState = 'intro' | 'spine' | 'detail';

export type EventData = {
  id: number;
  slug: string;
  title: string;
  color: string;
  desc: string;
  date: string;
};

// DATA
const EVENTS: EventData[] = [
  { 
    id: 2, 
    slug: "undyed",
    title: "UNDYED", 
    color: "#d946ef", 
    desc: "Post-holiday depression is a loop, we’re breaking it. We turn the city into a survival-horror simulation because the usual 'back to reality' routine is dead. UNDYED is the transition—a high-stakes hunt where you’re dodging the outbreak to reach the safe zone. This isn't just another party; it’s an invite-only recruitment for those who want to stay in the game while everyone else is clocking back in. Put your name on the registry before the infection spreads and we close the gates for good. Don't stay an NPC.", 
    date: "MAR 21 // 2026" 
  },
  { 
    id: 3, 
    slug: "2-piece",
    title: "2 PIECE", 
    color: "#ffd700", 
    desc: "India's largest, grandest city-wide treasure hunt returns to Chennai. The first-ever experiential reality game of its scale. The city is the board, the clues are real, and the clock is ticking. Prepare for the ultimate protocol.", 
    date: "COMING SOON" 
  },
  { 
    id: 1, 
    slug: "protocol-0",
    title: "PROTOCOL 0", 
    color: "#ff3333", 
    desc: "FEB 7 // 2026. Living is a repetitive loop and we’re bored of it. We’re burning cash to turn the streets into a live-action arena because the usual weekend plans are dead. Protocol 0 is dropping into the grid—no instructions, just lore and a hunt that actually makes you feel something. This is an invite-only registration for the ones who want to stop being NPCs and actually play the city. Put your name down before we close the loop and the coordinates vanish. Don't be late.", 
    date: "FEB 7 // 2026" 
  }
];

// CAMERA RIG
const Rig: React.FC<{ started: boolean }> = ({ started }) => {
  const { camera, pointer, size } = useThree();
  const isMobile = size.width < 768;

  useFrame(() => {
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

// INNER APP COMPONENT
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTickets, setShowTickets] = useState(false);
  const [viewState, setViewState] = useState<AppState>('intro');
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [targetColor, setTargetColor] = useState<string>('#ffffff');
  const [started, setStarted] = useState(true);
  
  // Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Modal States
  const [showRegister, setShowRegister] = useState(false); 
  const [showAuth, setShowAuth] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0); 

  // AUTH LISTENER
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsAuthenticated(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setIsAuthenticated(!!session));
    return () => subscription.unsubscribe();
  }, []);

  // URL ROUTER (The brain of the app)
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    
    // Close all modals first
    setShowAbout(false);
    setShowContact(false);
    setShowRegister(false);
    setShowAuth(false);
    setShowAccount(false);

    if (path === '/' || path === '') {
        setViewState('intro');
        setActiveEventId(null);
        setTargetColor('#ffffff');
    } else if (path === '/events') {
        setViewState('spine');
        setActiveEventId(null);
        setTargetColor('#333333');
    } else if (path === '/partners') {
        setShowAbout(true);
        if (viewState === 'intro') setViewState('spine');
        setTargetColor('#333333');
    } else if (path === '/contact') {
        setShowContact(true);
        if (viewState === 'intro') setViewState('spine');
        setTargetColor('#333333');
    } else {
        const event = EVENTS.find(e => path.includes(`/${e.slug}`));
        if (event) {
            setActiveEventId(event.id);
            setViewState('detail');
            setTargetColor(event.color);
            if (path.endsWith('/register')) {
                if (!isAuthenticated) setShowAuth(true);
                else setShowRegister(true);
            }
        }
    }
  }, [location.pathname, isAuthenticated]);

  // SCROLL LOGIC
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!started || showRegister || showAuth || showAbout || showContact || showAccount) return; 
      const now = Date.now();
      if (now - lastScrollTime.current < 1000) return;
      
      const threshold = 20;

      if (viewState === 'intro' && e.deltaY > threshold) {
        navigate('/events');
        lastScrollTime.current = now;
      } else if (viewState === 'spine' && e.deltaY < -threshold) {
        navigate('/');
        lastScrollTime.current = now;
      }
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [viewState, started, showRegister, showAuth, showAbout, showContact, showAccount, navigate]);

  // TOUCH LOGIC
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => touchStartY.current = e.touches[0].clientY;
    const handleTouchEnd = (e: TouchEvent) => {
        if (!started || showRegister || showAuth || showAbout || showContact || showAccount) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;
        const now = Date.now();
        if (now - lastScrollTime.current < 800) return;

        if (Math.abs(diff) > 50) {
            if (viewState === 'intro' && diff > 0) {
                navigate('/events');
                lastScrollTime.current = now;
            } else if (viewState === 'spine' && diff < 0) {
                navigate('/');
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
  }, [viewState, started, showRegister, showAuth, showAbout, showContact, showAccount, navigate]);

  const activeEvent = EVENTS.find(e => e.id === activeEventId) || null;

  return (
    <>
      {/* ALL MODALS RENDERED HERE AT THE ROOT */}
      <AnimatePresence>
        {showAbout && <AboutModal />}
        {showContact && <ContactModal />}
        {showAccount && <AccountModal onClose={() => navigate(-1)} />}
        {showTickets && <GridTicketsModal onClose={() => setShowTickets(false)} />}
        
        {showAuth && (
            <AuthModal 
                onClose={() => navigate(activeEvent ? `/${activeEvent.slug}` : '/events')}
                onSuccess={() => navigate(activeEvent ? `/${activeEvent.slug}/register` : '/events')}
            />
        )}

        {showRegister && activeEvent && isAuthenticated && (
            <RegistrationForm 
                event={activeEvent}
                onClose={() => navigate(`/${activeEvent.slug}`)}
                onSuccess={() => {
                    setShowRegister(false);
                    setShowTickets(true); // Pops the ticket open instantly!
                }}
            />
        )}
      </AnimatePresence>

      {/* FIXED NAVBAR */}
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onLoginClick={() => setShowAuth(true)} 
        onLogout={() => setIsAuthenticated(false)}
        onOpenAccount={() => setShowAccount(true)}
        onOpenTickets={() => setShowTickets(true)} // Pass the new prop
      />

      <div className="relative w-full h-full bg-black touch-none"> 
        <div className="absolute inset-0 z-0">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}>
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
                <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} radialModulation={false} modulationOffset={0} />
              </EffectComposer>
            </Suspense>
          </Canvas>
        </div>
        
        {started && (
            <Overlay 
              events={EVENTS}
              viewState={viewState}
              activeEvent={activeEvent}
              onSelectEvent={(event) => navigate(`/${event.slug}`)}
              onHoverEvent={(color) => { if (viewState === 'spine') setTargetColor(color); }}
              onHoverOut={() => { if (viewState === 'spine') setTargetColor('#333333'); }}
              onBack={() => navigate('/events')}
              onRegisterStart={() => activeEvent && navigate(`/${activeEvent.slug}/register`)}
            />
        )}
      </div>
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;