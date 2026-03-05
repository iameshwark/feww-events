import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState, EventData } from '../App';
import { audioManager } from '../utils/AudioManager';

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E`;

// MODAL 1: MISSION BRIEF
export const AboutModal: React.FC = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 pt-24">
    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-2xl w-full text-white pointer-events-auto max-h-[85dvh] overflow-y-auto custom-scrollbar p-2">
      <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-6 text-white/90">We Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">FeWW</span></h2>
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
    </motion.div>
  </motion.div>
);

// HELPER FOR CONTACT MODAL
const ContactLink = ({ label, value, href }: { label: string, value: string, href: string }) => (
  <a href={href} className="group relative block w-full border border-white/20 overflow-hidden bg-white text-black md:bg-black md:text-white md:hover:bg-white md:hover:text-black transition-all duration-300 ease-out">
    <div className="p-5 md:p-6">
      <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2">{label}</div>
      <div className="font-mono text-lg md:text-xl font-bold break-all md:hidden md:group-hover:block">{value}</div>
      <div className="hidden md:block md:group-hover:hidden font-mono text-lg tracking-widest opacity-30 text-white">/// ENCRYPTED ///</div>
    </div>
  </a>
);

// MODAL 2: COMMS ARRAY
export const ContactModal: React.FC = () => {
    const [msg, setMsg] = useState('');
    const [sent, setSent] = useState(false);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 pt-24">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full bg-black border border-white/10 p-6 md:p-8 relative pointer-events-auto max-h-[85dvh] overflow-y-auto custom-scrollbar">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold uppercase tracking-tighter text-white">Establish Uplink</h2>
                    <p className="text-[10px] text-white/40 tracking-widest mt-2">SECURE CONNECTION ESTABLISHED</p>
                </div>
                <div className="grid gap-4">
                    <ContactLink label="Priority Line" value="+91 90354 01456" href="tel:+919035401456" />
                    <ContactLink label="Electronic Mail" value="partners@feww.events" href="mailto:partners@feww.events" />
                </div>
                <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Or Transmit Message Directly</div>
                    {!sent ? (
                        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-4">
                            <textarea placeholder="ENTER MESSAGE PROTOCOLS..." value={msg} onChange={(e) => setMsg(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white outline-none focus:border-white transition-colors h-32 resize-none placeholder:text-white/20 font-mono uppercase" />
                            <button type="submit" className="bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-neutral-300 transition-colors w-full">Transmit Data</button>
                        </form>
                    ) : (
                        <div className="p-6 border border-green-500/50 bg-green-500/10 text-center">
                            <p className="text-green-400 font-mono text-xs tracking-widest">TRANSMISSION RECEIVED</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// MAIN OVERLAY COMPONENT
interface OverlayProps {
  events: EventData[];
  viewState: AppState;
  activeEvent: EventData | null;
  onSelectEvent: (event: EventData) => void;
  onHoverEvent: (color: string) => void;
  onHoverOut: () => void;
  onBack: () => void;
  onRegisterStart: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ events, viewState, activeEvent, onSelectEvent, onHoverEvent, onHoverOut, onBack, onRegisterStart }) => {
  const playClick = () => audioManager.playClick();
  const playHover = () => audioManager.playHover();

  useEffect(() => {
    const unlockAudio = () => audioManager.startAmbient();
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, []);

  return (
    <>
      {/* BACKGROUND GRADIENT & NOISE */}
      <div className="absolute inset-0 z-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)' }} />
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />

      {/* STATIC HUD FOREGROUND */}
      <div className="absolute inset-0 z-[90] pointer-events-none p-6 pb-10 md:p-12 flex flex-col justify-between text-white mix-blend-difference h-[100dvh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        
        <div></div> {/* Spacer to keep bottom row at the bottom */}

        {/* BOTTOM ROW (Media Links) */}
        <div className="flex justify-between items-end pointer-events-auto w-full">
          <div className="group flex flex-col items-start gap-2 max-w-[50%] p-2 -ml-2">
            <span className="hidden md:block text-[10px] uppercase tracking-widest opacity-40">Comms & Media</span>
            <div className="flex gap-6 mt-1">
                <a href="https://chat.whatsapp.com/GiqnDUtRKY588iiZN4SLSs" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-green-400 transition-colors">WhatsApp ↗</a>
                <a href="https://instagram.com/feww.events" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-pink-500 transition-colors">Instagram ↗</a>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC CONTENT VIEWS */}
      <div className="absolute inset-0 z-10 text-white font-sans h-[100dvh]">
        
        {/* --- STATE A: INTRO --- */}
        <AnimatePresence>
          {viewState === 'intro' && (
            <motion.div
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, y: -50, transition: { duration: 0.5 } }} 
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <motion.img 
                  src="/logo.png"
                  alt="FeWW Logo"
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.5, duration: 1.5 } }} 
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3, delay: 0 } }}
                  className="w-80 md:w-[600px] object-contain relative mix-blend-screen"
              />
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.5, transition: { delay: 1.5, duration: 1 } }} 
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="mt-8 text-xs uppercase tracking-widest mix-blend-difference animate-pulse"
              >
                  Scroll / Swipe to Enter
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- STATE B: SPINE (Event List) --- */}
        <AnimatePresence>
            {viewState === 'spine' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto h-[100dvh] pt-20 pb-20">
                <div className="flex flex-col gap-6 md:gap-8 w-full max-w-4xl px-4 items-center overflow-y-auto max-h-full no-scrollbar">
                    {events.map((event) => {
                        const isSpecial = event.title === "2 PIECE";
                        const isUndyed = event.title === "UNDYED";
                        return (
                            <motion.div key={event.id} layoutId={`container-${event.id}`} className={`group cursor-pointer relative text-center shrink-0 py-4 ${isSpecial ? 'my-8' : ''}`} onClick={() => { playClick(); onSelectEvent(event); }} onMouseEnter={() => { playHover(); onHoverEvent(event.color); }} onMouseLeave={onHoverOut}>
                                    {isSpecial ? (
                                        <div className="relative border border-[#ffd700] p-6 md:p-10 bg-[#ffd700]/5 hover:bg-[#ffd700]/10 transition-all duration-500 backdrop-blur-sm group-hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4 border border-[#ffd700] text-[#ffd700] text-[10px] tracking-[0.3em] font-bold uppercase">Flagship Protocol</div>
                                            <motion.h2 layoutId={`title-${event.id}`} className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-[#ffd700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">{event.title}</motion.h2>
                                            <p className="text-[#ffd700] text-[10px] tracking-[0.5em] mt-2 opacity-60">COMING SOON</p>
                                        </div>
                                    ) : isUndyed ? (
                                        <motion.h2 layoutId={`title-${event.id}`} className="text-4xl md:text-7xl font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 hover:brightness-125 transition-all duration-300">{event.title}</motion.h2>
                                    ) : (
                                        <motion.h2 layoutId={`title-${event.id}`} className="text-4xl md:text-7xl font-bold uppercase tracking-tighter text-white/50 group-hover:text-white transition-colors duration-300">{event.title}</motion.h2>
                                    )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
            )}
        </AnimatePresence>

        {/* --- STATE C: DETAIL (Event Specific) --- */}
        <AnimatePresence>
          {viewState === 'detail' && activeEvent && (
            <div className="absolute inset-0 pointer-events-auto bg-black/80 md:bg-transparent h-[100dvh] overflow-y-auto z-20">
              <div className="flex flex-col md:flex-row min-h-full">
                  <div className="w-full md:w-1/2 p-6 pt-24 md:p-16 flex flex-col justify-start md:justify-center relative">
                      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { playClick(); onBack(); }} className="absolute top-28 left-6 md:top-32 md:left-12 text-xs font-bold uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full mb-4 bg-black/50 backdrop-blur-md z-50 hover:bg-white hover:text-black transition-colors">&larr; Back</motion.button>
                      <motion.h2 layoutId={`title-${activeEvent.id}`} className={`text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mt-12 md:mt-0 ${activeEvent.title === 'UNDYED' ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500' : ''}`} style={{ color: activeEvent.title === 'UNDYED' ? undefined : activeEvent.color }}>{activeEvent.title}</motion.h2>
                  </div>
                  <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center bg-gradient-to-t from-black via-black/90 to-transparent md:bg-gradient-to-l md:from-black/80">
                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ delay: 0.2 }}>
                          <p className="text-xs font-mono text-white/50 mb-4 tracking-widest border-l-2 pl-4" style={{ borderColor: activeEvent.color }}>{activeEvent.date}</p>
                          <p className="text-lg md:text-2xl leading-relaxed font-light text-white/90 mb-8">{activeEvent.desc}</p>
                          
                          {activeEvent.id === 1 || activeEvent.id === 2 ? (
                              <button onClick={() => { playClick(); onRegisterStart(); }} className="mt-8 px-10 py-5 font-black uppercase tracking-[0.2em] text-black hover:brightness-125 transition-all active:scale-95 border-none inline-block" style={{ backgroundColor: activeEvent.color }}>Register Now</button>
                          ) : (
                              <div className="mt-8 p-4 border border-white/20 bg-white/5 text-center md:text-left backdrop-blur-sm inline-block">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Status</p>
                                <p className="text-xl md:text-2xl font-black uppercase tracking-widest text-white">Awaiting Intel</p>
                              </div>
                          )}
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