import React, { useState } from 'react';
import { Overlay } from './components/Overlay';
import { Preloader } from './components/Preloader';
import { FluidBackground } from './components/FluidBackground';
import { RegistrationForm } from './components/RegistrationForm';
import { AnimatePresence } from 'framer-motion';

// 1. DEFINE DATA HERE (So it never crashes)
export const eventData = {
  id: 'protocol-13',
  title: 'PROTOCOL 13',
  date: 'FEB 13 // 2026',
  description: 'A city-wide treasure hunt in Chennai.',
  color: '#00ff00'
};

function App() {
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      
      {/* 2. BACKGROUND (Always rendered but hidden behind preloader) */}
      <div className="fixed inset-0 z-0">
        <FluidBackground />
      </div>

      {/* 3. PRELOADER & MAIN CONTENT */}
      <AnimatePresence mode="wait">
        {loading ? (
          <Preloader key="preloader" onEnter={() => setLoading(false)} />
        ) : (
          <>
            {/* THE MAIN OVERLAY */}
            <Overlay 
              key="overlay"
              event={eventData} 
              onOpenRegistration={() => setShowRegister(true)} 
            />

            {/* THE REGISTRATION FORM POPUP */}
            {showRegister && (
              <RegistrationForm 
                event={eventData} 
                onClose={() => setShowRegister(false)}
                onProceedToPayment={(data) => console.log(data)}
              />
            )}
          </>
        )}
      </AnimatePresence>
      
    </div>
  );
}

export default App;