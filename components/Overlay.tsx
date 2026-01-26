import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '../utils/AudioManager';
import { supabase } from '../utils/supabaseClient';

// 🔴 SAFETY FIX: Define the interface HERE so it doesn't crash if App.tsx is different
export interface EventData {
  id: string;
  title: string;
  date: string;
  description: string;
  color: string;
}

interface OverlayProps {
  event: EventData;
  onOpenRegistration: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ event, onOpenRegistration }) => {
  const [phone, setPhone] = useState('');
  const [joined, setJoined] = useState(false);

  // Safe audio playing
  const playClick = () => { try { audioManager.playClick(); } catch(e) {} };
  const playHover = () => { try { audioManager.playHover(); } catch(e) {} };

  const handleJoin = async () => {
    if (phone.length > 9) {
      playClick();
      setJoined(true);
      const { error } = await supabase.from('community_leads').insert([{ phone }]);
      if (error) console.error('Error', error);
    }
  };

  return (
    // 🔴 LAYOUT FIX: Forced 100dvh with Grid to separate Header/Main/Footer
    <div 
      className="absolute inset-0 w-full z-10 overflow-y-auto overflow-x-hidden pointer-events-auto bg-transparent"
      style={{ height: '100dvh' }} // Inline style to force mobile browser height
    >
      <div className="w-full h-full min-h-[600px] grid grid-rows-[auto_1fr_auto] p-6 pb-32 md:p-12 max-w-[1600px] mx-auto">
        
        {/* --- ROW 1: HEADER --- */}
        <header className="flex justify-between items-start pt-safe-top">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter leading-none text-white">FEWW</h1>
            <span className="text-[10px] uppercase tracking-widest opacity-50 text-white">Event Protocol</span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-white">LIVE</span>
            </div>
          </div>
        </header>

        {/* --- ROW 2: MAIN CONTENT (Centered) --- */}
        <main className="flex flex-col justify-center items-start w-full py-8">
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
              className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8 mix-blend-difference"
              style={{ color: 'white', WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}
            >
              {event.title}
            </h2>
            
            <div className="max-w-md text-sm md:text-lg text-white/80 leading-relaxed mb-10">
              <p className="mb-4 drop-shadow-md">
                A city-wide treasure hunt in Chennai. 
                Navigate the chaos. Find the extraction point.
              </p>
            </div>

            <button
              onClick={() => { playClick(); onOpenRegistration(); }}
              className="w-full md:w-auto px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Initiate Protocol &rarr;
            </button>
          </motion.div>
        </main>

        {/* --- ROW 3: FOOTER (Pushed to bottom) --- */}
        <footer className="w-full pt-6 border-t border-white/10 bg-gradient-to-t from-black/80 to-transparent md:bg-none pb-safe-bottom">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            
            {/* WhatsApp Input */}
            <div className="w-full md:w-auto">
                {!joined ? (
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-[10px] uppercase tracking-widest opacity-60 text-white">
                      Receive Event Updates
                    </span>
                    <div className="flex items-center border-b border-white/30 w-full md:w-auto">
                      <input 
                        type="tel" 
                        placeholder="WHATSAPP NUMBER" 
                        className="bg-transparent text-xs py-3 w-full md:w-48 outline-none text-white placeholder:text-white/30"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <button onClick={handleJoin} className="text-white px-4">&rarr;</button>
                    </div>
                  </div>
                ) : (
                  <span className="text-green-400 text-xs tracking-widest border border-green-400 px-3 py-2">
                    NUMBER SECURED
                  </span>
                )}
            </div>

            {/* Version Tag (To confirm update) */}
            <div className="text-right opacity-30">
               <p className="text-[10px] uppercase tracking-widest text-white">v2.0 // Mobile Optimized</p>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
};