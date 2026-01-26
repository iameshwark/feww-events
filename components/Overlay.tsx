import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { AppState, EventData } from '../App';
import { audioManager } from '../utils/AudioManager';
import { supabase } from '../utils/supabaseClient';

// -----------------------------------------------------------------------------
// ASSETS
// -----------------------------------------------------------------------------
const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E`;

// -----------------------------------------------------------------------------
// HELPER COMPONENTS
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// MODAL 1: MISSION BRIEF (ABOUT + TEAM)
// -----------------------------------------------------------------------------
const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
    onClick={onClose}
  >
    <motion.div 
      initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="max-w-2xl w-full text-white pointer-events-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-4xl font-bold uppercase tracking-tighter mb-8 text-white/90">
        We Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">FeWW</span>
      </h2>
      
      {/* NEW COPY */}
      <div className="space-y-6 text-sm md:text-base leading-relaxed text-white/70 font-light font-mono">
        <p>
          FEWW is an independent event and entertainment collective focused on building experiences people actually want to be part of.
        </p>
        <p>
          We design interactive events that mix strategy, movement, problem-solving, and chaos in the right amount, pushing participants out of passive watching and into real involvement.
        </p>
        <p>
          Our formats are simple on the surface, layered underneath, and built to make people think, move, and compete together.
        </p>
        <p className="font-bold text-white">
          No fillers. No forced hype. Just well-designed experiences that stay with you.
        </p>

        <hr className="border-white/10 my-8" />
        
        {/* TEAM SECTION */}
        <div className="flex flex-col md:flex-row gap-8 justify-between">
            <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">The Collective</h3>
                <p className="text-xs text-white/40 mb-4">
                    Architects, designers, and chaos-managers. Meet the minds behind the protocols.
                </p>
                <button 
                    className="px-6 py-3 border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all text-xs font-bold uppercase tracking-widest"
                    onClick={() => alert("Team Page/Modal would open here.")}
                >
                    [ ACCESS TEAM ROSTER ]
                </button>
            </div>

            {/* PARTNERS SECTION */}
            <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Partners</h3>
                <p className="text-xs uppercase tracking-widest text-white/40 mb-4">
                    [ OFFICIAL PARTNERS REVEAL PENDING ]
                </p>
                <button 
                    className="text-xs underline decoration-white/30 hover:decoration-white transition-all"
                    onClick={() => window.open('mailto:partners@feww.events')}
                >
                    Request Sponsorship Deck &rarr;
                </button>
            </div>
        </div>
      </div>

      <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
        [CLOSE]
      </button>
    </motion.div>
  </motion.div>
);

// -----------------------------------------------------------------------------
// MODAL 2: COMMS ARRAY (CONTACT)
// -----------------------------------------------------------------------------
const ContactModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [msg, setMsg] = useState('');
    const [sent, setSent] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="max-w-lg w-full bg-black border border-white/10 p-8 relative pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold uppercase tracking-tighter text-white mb-2">Establish Uplink</h2>
                <p className="text-xs font-mono text-white/40 tracking-widest mb-8">SELECT COMMUNICATION CHANNEL</p>

                <div className="grid gap-4">
                    <a href="tel:+919035401456" className="group p-4 border border-white/10 hover:bg-white hover:text-black transition-all flex justify-between items-center">
                        <div>
                            <div className="text-[10px] uppercase tracking-widest opacity-60">Priority Line (Call / WA)</div>
                            <div className="text-xl font-mono mt-1">+91 90354 01456</div>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100">&rarr;</span>
                    </a>

                    <a href="mailto:contact@feww.events" className="group p-4 border border-white/10 hover:bg-white hover:text-black transition-all flex justify-between items-center">
                        <div>
                            <div className="text-[10px] uppercase tracking-widest opacity-60">Electronic Mail</div>
                            <div className="text-xl font-mono mt-1">contact@feww.events</div>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100">&rarr;</span>
                    </a>
                    
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Or Transmit Message Directly</div>
                        {!sent ? (
                            <form onSubmit={handleSend} className="flex flex-col gap-4">
                                <textarea 
                                    placeholder="ENTER MESSAGE PROTOCOLS..." 
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white outline-none focus:border-white transition-colors h-32 resize-none placeholder:text-white/20"
                                />
                                <button type="submit" className="bg-white text-black py-3 font-bold uppercase tracking-widest text-xs hover:bg-neutral-300 transition-colors">
                                    Transmit Data
                                </button>
                            </form>
                        ) : (
                            <div className="p-8 border border-green-500/50 bg-green-500/10 text-center">
                                <p className="text-green-400 font-mono text-sm">TRANSMISSION RECEIVED</p>
                                <p className="text-white/40 text-xs mt-2">Stand by for response.</p>
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                    [CLOSE]
                </button>
            </motion.div>
        </motion.div>
    );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

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
  
  const playHover = () => audioManager.playHover();
  const playClick = () => audioManager.playClick();

  useEffect(() => {
    const unlockAudio = () => audioManager.startAmbient();
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, []);

  return (
    <>
      <div className="absolute inset-0 z-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)' }} />
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />

      {/* --- HUD NAVIGATION --- */}
      <div className="absolute inset-0 z-[90] pointer-events-none p-6 md:p-12 flex flex-col justify-between text-white mix-blend-difference">
        
        {/* TOP ROW */}
        <div className="flex justify-between items-start pointer-events-auto">
          {/* TOP LEFT: FeWW EVENTS */}
          <Magnetic strength={0.2}>
            <button 
              onClick={() => { playClick(); onBack(); }}
              className="group flex flex-col items-start"
            >
              <span className="text-2xl font-black tracking-tighter">FeWW</span>
              <span className="text-[10px] tracking-[0.2em] opacity-50 group-hover:opacity-100 transition-opacity">
                EVENTS
              </span>
            </button>
          </Magnetic>

          {/* TOP RIGHT: ABOUT */}
          <Magnetic strength={0.2}>
            <button 
              onClick={() => { playClick(); setShowAbout(true); }}
              className="text-xs font-bold tracking-widest uppercase opacity-60 hover:opacity-100 border-b border-transparent hover:border-white transition-all pb-1"
            >
              Mission Brief / Partners
            </button>
          </Magnetic>
        </div>

        {/* BOTTOM ROW */}
        <div className="flex justify-between items-end pointer-events-auto">
          
          {/* BOTTOM LEFT: WHATSAPP UPDATES */}
          <div className="group flex flex-col items-start gap-2">
            {!joined ? (
                <>
                    <span className="text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                    Receive Event Updates
                    </span>
                    <div className="flex items-center border-b border-white/20 group-hover:border-white transition-colors">
                    <input 
                        type="tel" 
                        placeholder="WHATSAPP NUMBER" 
                        className="bg-transparent text-xs py-2 w-32 focus:w-48 transition-all outline-none placeholder:text-white/30 uppercase tracking-widest"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && phone.length > 9) {
                                // Allow pressing Enter to submit
                                playClick();
                                setJoined(true);
                                supabase.from('community_leads').insert([{ phone }]).then(() => console.log('Lead Saved'));
                            }
                        }}
                    />
                    <button 
                        onClick={() => {
                            if(phone.length > 9) {
                                playClick();
                                setJoined(true);
                                // SAVE TO DB
                                supabase.from('community_leads').insert([{ phone }]).then(({ error }) => {
                                    if (error) console.error('Error saving lead:', error);
                                });
                            }
                        }}
                        className="text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 hover:text-green-400"
                    >
                        &rarr;
                    </button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-green-400 tracking-widest">NUMBER SECURED</span>
                    <a 
                        href="https://chat.whatsapp.com/YOUR_REAL_GROUP_LINK_HERE" 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all"
                    >
                        Click to Join Community &rarr;
                    </a>
                </div>
            )}
          </div>
          
          {/* BOTTOM RIGHT: CONTACT HQ */}
          <Magnetic strength={0.2}>
            <button 
              onClick={() => { playClick(); setShowContact(true); }}
              className="text-xs font-bold tracking-widest uppercase opacity-60 hover:opacity-100 border-b border-transparent hover:border-white transition-all pb-1"
            >
              Contact HQ
            </button>
          </Magnetic>
        </div>
      </div>

      <AnimatePresence>
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      </AnimatePresence>

      <div className="absolute inset-0 z-10 text-white selection:bg-white selection:text-black font-sans">
        
        {/* --- STATE A: INTRO --- */}
        <AnimatePresence>
          {viewState === 'intro' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.8 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <motion.h1 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                  className="text-5xl md:text-9xl font-black tracking-tighter relative text-transparent"
                  style={{ WebkitTextStroke: '2px rgba(255, 255, 255, 0.8)' }}
              >
                  FeWW
              </motion.h1>
              <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 1 }}
                  className="mt-8 text-xs uppercase tracking-widest mix-blend-difference"
              >
                  Scroll to Enter
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- STATE B: SPINE --- */}
        {viewState === 'spine' && (
          <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
          >
              <div className="flex flex-col gap-8 w-full max-w-4xl px-8 items-center">
                  {events.map((event) => (
                      <motion.div
                          key={event.id}
                          layoutId={`container-${event.id}`}
                          className="group cursor-pointer relative"
                          onClick={() => { playClick(); onSelectEvent(event); }}
                          onMouseEnter={() => { playHover(); onHoverEvent(event.color); }}
                          onMouseLeave={onHoverOut}
                      >
                          <Magnetic strength={0.4}>
                            <motion.h2
                                layoutId={`title-${event.id}`}
                                className="text-3xl md:text-7xl font-bold uppercase tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity duration-300 text-center"
                            >
                                {event.title}
                            </motion.h2>
                          </Magnetic>
                      </motion.div>
                  ))}
              </div>
          </motion.div>
        )}

        {/* --- STATE C: DETAIL --- */}
        <AnimatePresence>
          {viewState === 'detail' && activeEvent && (
            <div className="absolute inset-0 pointer-events-none">
              
              <motion.div 
                  layoutId={`container-${activeEvent.id}`}
                  className="absolute top-0 left-0 p-6 md:p-16 z-20 pointer-events-auto mt-24 md:mt-20"
              >
                  <motion.h2
                      layoutId={`title-${activeEvent.id}`}
                      className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white"
                      style={{ color: activeEvent.color }}
                  >
                      {activeEvent.title}
                  </motion.h2>
                  
                  <motion.button
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.5 }}
                      onClick={() => { playClick(); onBack(); }}
                      className="mt-8 text-sm uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity border-b border-white/20 pb-1"
                  >
                      &larr; Back to Index
                  </motion.button>
              </motion.div>

              <div className="absolute top-0 right-0 w-full md:w-1/2 h-full flex flex-col justify-center p-8 md:p-16 pointer-events-auto bg-gradient-to-l from-black/80 to-transparent">
                  <motion.div
                      initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
                      transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                  >
                      <p className="text-sm font-mono text-white/50 mb-6 tracking-widest border-l-2 pl-4" style={{ borderColor: activeEvent.color }}>
                          {activeEvent.date}
                      </p>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-xl md:text-3xl leading-snug font-light min-h-[120px]"
                      >
                        {activeEvent.desc}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
                        className="mt-12"
                      >
                        <button 
                          onClick={() => { playClick(); onRegisterStart(); }}
                          className="group relative px-8 py-4 bg-white/5 border border-white/20 hover:border-white transition-colors duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold tracking-[0.2em] uppercase">Initiate Registration</span>
                            <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">&rarr;</span>
                          </div>
                          <div className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 mix-blend-difference" />
                        </button>
                        <p className="mt-4 text-[10px] uppercase tracking-widest text-white/40">Limited Spots Available</p>
                      </motion.div>

                  </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};