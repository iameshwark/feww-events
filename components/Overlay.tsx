import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { AppState, EventData } from '../App';
import { audioManager } from '../utils/AudioManager';
import { supabase } from '../utils/supabaseClient';

// ASSETS
const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E`;

// HELPER: Magnetic Button
const Magnetic: React.FC<{ children: ReactNode; className?: string; strength?: number }> = ({ children, className = "", strength = 0.3 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const position = { x: useMotionValue(0), y: useMotionValue(0) };
  const x = useSpring(position.x, { damping: 15, stiffness: 150, mass: 0.1 });
  const y = useSpring(position.y, { damping: 15, stiffness: 150, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    position.x.set((clientX - centerX) * strength);
    position.y.set((clientY - centerY) * strength);
  };
  const handleMouseLeave = () => { position.x.set(0); position.y.set(0); };
  return (
    <motion.div ref={ref} className={className} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ x, y }}>
      {children}
    </motion.div>
  );
};

// MODAL 1: MISSION BRIEF
const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
    onClick={onClose}
  >
    <motion.div 
      initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="max-w-2xl w-full text-white pointer-events-auto max-h-[85dvh] overflow-y-auto custom-scrollbar p-2"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-6 text-white/90">
        We Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">FeWW</span>
      </h2>
      <div className="space-y-4 md:space-y-6 text-sm md:text-base leading-relaxed text-white/70 font-light font-mono">
        <p>FEWW is an independent event and entertainment collective focused on building experiences people actually want to be part of.</p>
        <p>We design interactive events that mix strategy, movement, problem-solving, and chaos in the right amount.</p>
        <p className="font-bold text-white">No fillers. No forced hype. Just well-designed experiences that stay with you.</p>
        <hr className="border-white/10 my-6" />
        <div className="flex flex-col md:flex-row gap-8 justify-between">
            <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-2">The Collective</h3>
                <p className="text-xs text-white/40 mb-4">Architects, designers, and chaos-managers.</p>
                <button className="px-6 py-3 border border-white/20 hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest" onClick={() => alert("Coming Soon")}>[ ACCESS ROSTER ]</button>
            </div>
            <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-2">Partners</h3>
                <button className="text-xs underline decoration-white/30 hover:decoration-white transition-all" onClick={() => window.open('mailto:partners@feww.events')}>Request Sponsorship Deck &rarr;</button>
            </div>
        </div>
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 text-white/40 hover:text-white transition-colors">[CLOSE]</button>
    </motion.div>
  </motion.div>
);

// --- HELPER FOR CONTACT LINKS ---
const ContactLink = ({ label, value, href }: { label: string, value: string, href: string }) => (
  <a
    href={href}
    className="group relative block w-full border border-white/20 overflow-hidden
    bg-white text-black
    md:bg-black md:text-white md:hover:bg-white md:hover:text-black
    transition-all duration-300 ease-out"
  >
    <div className="p-5 md:p-6">
      <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2">{label}</div>
      <div className="font-mono text-lg md:text-xl font-bold break-all md:hidden md:group-hover:block">{value}</div>
      <div className="hidden md:block md:group-hover:hidden font-mono text-lg tracking-widest opacity-30 text-white">/// ENCRYPTED ///</div>
    </div>
  </a>
);

// MODAL 2: COMMS ARRAY
const ContactModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [msg, setMsg] = useState('');
    const [sent, setSent] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="max-w-lg w-full bg-black border border-white/10 p-6 md:p-8 relative pointer-events-auto max-h-[85dvh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-8">
                    <h2 className="text-3xl font-bold uppercase tracking-tighter text-white">Establish Uplink</h2>
                    <p className="text-[10px] text-white/40 tracking-widest mt-2">SECURE CONNECTION ESTABLISHED</p>
                </div>

                <div className="grid gap-4">
                    <ContactLink label="Priority Line" value="+91 90354 01456" href="tel:+919035401456" />
                    <ContactLink label="Electronic Mail" value="contact@feww.events" href="mailto:contact@feww.events" />
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Or Transmit Message Directly</div>
                    {!sent ? (
                        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-4">
                            <textarea 
                                placeholder="ENTER MESSAGE PROTOCOLS..." 
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white outline-none focus:border-white transition-colors h-32 resize-none placeholder:text-white/20 font-mono uppercase"
                            />
                            <button type="submit" className="bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-neutral-300 transition-colors w-full">
                                Transmit Data
                            </button>
                        </form>
                    ) : (
                        <div className="p-6 border border-green-500/50 bg-green-500/10 text-center">
                            <p className="text-green-400 font-mono text-xs tracking-widest">TRANSMISSION RECEIVED</p>
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors text-xs tracking-widest">[CLOSE]</button>
            </motion.div>
        </motion.div>
    );
}

// MAIN COMPONENT
interface OverlayProps {
  events: EventData[];
  viewState: AppState;
  activeEvent: EventData | null;
  onEnterSpine: () => void;
  onSelectEvent: (event: EventData) => void;
  onHoverEvent: (color: string) => void;
  onHoverOut: () => void;
  onBack: () => void;
  onRegisterStart: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({
  events,
  viewState,
  activeEvent,
  onEnterSpine,
  onSelectEvent,
  onHoverEvent,
  onHoverOut,
  onBack,
  onRegisterStart,
}) => {
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [phone, setPhone] = useState('');
  const [joined, setJoined] = useState(false);
  const playClick = () => audioManager.playClick();

  useEffect(() => {
    const unlockAudio = () => audioManager.startAmbient();
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  return (
    <>
      <div className="absolute inset-0 z-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)' }} />
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />

      {/* --- HUD NAVIGATION --- */}
      {/* 🔴 FIXED: Increased padding to p-6 for more breathing room */}
      <div className="absolute inset-0 z-[90] pointer-events-none p-6 pb-10 md:p-12 flex flex-col justify-between text-white mix-blend-difference h-[100dvh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        
        {/* TOP ROW */}
        <div className="flex justify-between items-start pointer-events-auto">
          <Magnetic strength={0.2}>
            {/* 🔴 FIXED: Added p-2 padding area for easier clicking */}
            <button onClick={() => { playClick(); onBack(); }} className="group flex flex-col items-start p-2 -ml-2">
              <span className="text-2xl md:text-3xl font-black tracking-tight md:tracking-tighter">FeWW</span>
              {/* 🔴 FIXED: Increased text size to text-xs (12px) */}
              <span className="text-xs tracking-[0.2em] opacity-50 group-hover:opacity-100 transition-opacity">EVENTS</span>
            </button>
          </Magnetic>

          <Magnetic strength={0.2}>
            {/* 🔴 FIXED: Increased text size and added padding area */}
            <button onClick={() => { playClick(); setShowAbout(true); }} className="text-xs font-bold tracking-widest uppercase opacity-60 hover:opacity-100 border-b border-transparent hover:border-white transition-all pb-1 text-right p-2 -mr-2">
              Mission Brief<br className="md:hidden"/> / Partners
            </button>
          </Magnetic>
        </div>

        {/* BOTTOM ROW */}
        <div className="flex justify-between items-end pointer-events-auto">
          <div className="group flex flex-col items-start gap-2 max-w-[50%] p-2 -ml-2">
            {!joined ? (
                <>
                    <span className="hidden md:block text-xs uppercase tracking-widest opacity-40">Receive Updates</span>
                    <div className="flex items-center border-b border-white/20 group-hover:border-white transition-colors w-full">
                        {/* 🔴 FIXED: Bigger input text */}
                        <input 
                            type="tel" 
                            placeholder="WHATSAPP" 
                            className="bg-transparent text-xs py-3 w-full outline-none placeholder:text-white/30 uppercase tracking-widest"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <button onClick={() => { if(phone.length > 9) { playClick(); setJoined(true); supabase.from('community_leads').insert([{ phone }]); }}} className="text-sm px-3 text-white/50 hover:text-green-400">&rarr;</button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-green-400 tracking-widest">SECURED</span>
                </div>
            )}
          </div>
          
          <Magnetic strength={0.2}>
             {/* 🔴 FIXED: Bigger text and padding area */}
            <button onClick={() => { playClick(); setShowContact(true); }} className="text-xs font-bold tracking-widest uppercase opacity-60 hover:opacity-100 border-b border-transparent hover:border-white transition-all pb-1 p-2 -mr-2">
              Contact HQ
            </button>
          </Magnetic>
        </div>
      </div>

      <AnimatePresence>
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      </AnimatePresence>

      <div className="absolute inset-0 z-10 text-white font-sans h-[100dvh]">
        
        {/* --- STATE A: INTRO --- */}
        <AnimatePresence>
          {viewState === 'intro' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.8 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <motion.h1 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 1.5 }}
                  className="text-6xl md:text-9xl font-black tracking-tight md:tracking-tighter relative text-transparent"
                  style={{ WebkitTextStroke: window.innerWidth < 768 ? '1px rgba(255, 255, 255, 0.8)' : '2px rgba(255, 255, 255, 0.8)' }}
              >
                  FeWW
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 1 }} className="mt-8 text-xs uppercase tracking-widest mix-blend-difference animate-pulse">
                  Scroll / Swipe to Enter
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- STATE B: SPINE --- */}
        {viewState === 'spine' && (
          <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto h-[100dvh] pt-20 pb-20"
          >
              <div className="flex flex-col gap-6 md:gap-8 w-full max-w-4xl px-4 items-center overflow-y-auto max-h-full no-scrollbar">
                  {events.map((event) => (
                      <motion.div
                          key={event.id}
                          layoutId={`container-${event.id}`}
                          className="group cursor-pointer relative text-center shrink-0 py-4"
                          onClick={() => { playClick(); onSelectEvent(event); }}
                      >
                            <motion.h2
                                layoutId={`title-${event.id}`}
                                className="text-4xl md:text-7xl font-bold uppercase tracking-tighter text-white/50 group-hover:text-white transition-colors duration-300"
                            >
                                {event.title}
                            </motion.h2>
                      </motion.div>
                  ))}
              </div>
          </motion.div>
        )}

        {/* --- STATE C: DETAIL --- */}
        <AnimatePresence>
          {viewState === 'detail' && activeEvent && (
            <div className="absolute inset-0 pointer-events-auto bg-black/80 md:bg-transparent h-[100dvh] overflow-y-auto z-20">
              
              <div className="flex flex-col md:flex-row min-h-full">
                  
                  {/* Left Side (Title) */}
                  <div className="w-full md:w-1/2 p-6 pt-24 md:p-16 flex flex-col justify-start md:justify-center relative">
                      <motion.button
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          onClick={() => { playClick(); onBack(); }}
                          className="absolute top-28 left-6 md:top-12 md:left-12 text-xs font-bold uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full mb-4 bg-black/50 backdrop-blur-md z-50"
                      >
                          &larr; Back
                      </motion.button>

                      <motion.h2
                          layoutId={`title-${activeEvent.id}`}
                          className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mt-12 md:mt-0"
                          style={{ color: activeEvent.color }}
                      >
                          {activeEvent.title}
                      </motion.h2>
                  </div>

                  {/* Right Side (Content) */}
                  <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center bg-gradient-to-t from-black via-black/90 to-transparent md:bg-gradient-to-l md:from-black/80">
                      <motion.div
                          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                      >
                          <p className="text-xs font-mono text-white/50 mb-4 tracking-widest border-l-2 pl-4" style={{ borderColor: activeEvent.color }}>
                              {activeEvent.date}
                          </p>
                          <p className="text-lg md:text-2xl leading-relaxed font-light text-white/90 mb-8">
                            {activeEvent.desc}
                          </p>
                          <button 
                            onClick={() => { playClick(); onRegisterStart(); }}
                            className="w-full md:w-auto px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-neutral-200 transition-all mb-12"
                          >
                            Initiate Registration &rarr;
                          </button>
                      </motion.div>
                  </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};