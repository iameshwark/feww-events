import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '../utils/AudioManager';
import { EventData } from '../App';
import { supabase } from '../utils/supabaseClient';

interface OverlayProps {
  event: EventData;
  onOpenRegistration: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ event, onOpenRegistration }) => {
  const [phone, setPhone] = useState('');
  const [joined, setJoined] = useState(false);

  const playClick = () => audioManager.playClick();
  const playHover = () => audioManager.playHover();

  const handleJoin = async () => {
    if (phone.length > 9) {
      playClick();
      setJoined(true);
      const { error } = await supabase.from('community_leads').insert([{ phone }]);
      if (error) console.error('Error saving lead:', error);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-[100dvh] z-10 overflow-y-auto overflow-x-hidden pointer-events-auto bg-transparent">
      
      <div className="min-h-[100dvh] w-full flex flex-col justify-between p-6 pb-24 md:p-12 relative max-w-[1600px] mx-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        
        {/* --- HEADER --- */}
        <header className="flex justify-between items-start pt-4 md:pt-0 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter leading-none text-white">FEWW</h1>
            <span className="text-[10px] uppercase tracking-widest opacity-50 text-white">Event Protocol</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono opacity-50 text-white">STATUS</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-white">LIVE</span>
            </div>
          </div>
        </header>

        {/* --- HERO SECTION --- */}
        <main className="flex flex-col items-start justify-center flex-grow py-8 md:py-20 my-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <p className="text-xs md:text-base font-mono text-white/60 mb-2 tracking-widest">
              INCOMING TRANSMISSION // {event.date}
            </p>
            
            <h2 
              className="text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-6 mix-blend-difference break-words"
              style={{ color: 'white', WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}
            >
              {event.title}
            </h2>
            
            <div className="max-w-md text-sm md:text-lg text-white/80 leading-relaxed mb-8 md:mb-12">
              <p className="mb-4 drop-shadow-md">
                A city-wide treasure hunt in Chennai. 
                Navigate the chaos. Decode the signals. 
                Find the extraction point.
              </p>
              <div className="font-mono text-[10px] md:text-xs opacity-60 bg-black/40 p-2 inline-block rounded border border-white/10 backdrop-blur-sm">
                // LOCATION: UNKNOWN<br/>
                // SQUAD: 1-4 AGENTS<br/>
                // BOUNTY: ₹15,000
              </div>
            </div>

            <button
              onClick={() => { playClick(); onOpenRegistration(); }}
              onMouseEnter={playHover}
              className="w-full md:w-auto group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                Initiate Protocol
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </motion.div>
        </main>

        {/* --- FOOTER --- */}
        <footer className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end border-t border-white/10 pt-6 pb-8 md:pb-0 shrink-0 bg-gradient-to-t from-black/80 to-transparent md:bg-none">
          
          <div className="group flex flex-col items-start gap-2 w-full">
            {!joined ? (
              <>
                <span className="text-[10px] uppercase tracking-widest opacity-60 text-white">
                  Receive Event Updates
                </span>
                <div className="flex items-center border-b border-white/30 focus-within:border-white transition-colors w-full md:w-auto">
                  <input 
                    type="tel" 
                    placeholder="WHATSAPP NUMBER" 
                    className="bg-transparent text-xs py-3 w-full md:w-48 outline-none placeholder:text-white/30 uppercase tracking-widest text-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  />
                  <button 
                    onClick={handleJoin}
                    className="text-xs text-white opacity-80 hover:text-green-400 px-4 py-2"
                  >
                    &rarr;
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <span className="text-[10px] text-green-400 tracking-widest">NUMBER SECURED</span>
                <a 
                  href="https://chat.whatsapp.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all text-center md:text-left text-white"
                >
                  Join Community &rarr;
                </a>
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-col items-end text-right">
             <p className="text-[10px] uppercase tracking-widest opacity-30 text-white">System Architecture: v1.0.4</p>
             <p className="text-[10px] uppercase tracking-widest opacity-30 text-white">Secure Connection: TLS 1.3</p>
          </div>

        </footer>
      </div>
    </div>
  );
};