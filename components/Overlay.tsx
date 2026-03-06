import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState, EventData } from '../App';
import { audioManager } from '../utils/AudioManager';

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E`;

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
                <button className="text-xs underline decoration-white/30 hover:decoration-white transition-all" onClick={() => window.open('mailto:partners@feww.events')}>Request Sponsorship Deck →</button>
            </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const ContactLink = ({ label, value, href }: { label: string, value: string, href: string }) => (
  <a href={href} className="group relative block w-full border border-white/20 overflow-hidden bg-white text-black md:bg-black md:text-white md:hover:bg-white md:hover:text-black transition-all duration-300 ease-out">
    <div className="p-5 md:p-6">
      <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2">{label}</div>
      <div className="font-mono text-lg md:text-xl font-bold break-all md:hidden md:group-hover:block">{value}</div>
      <div className="hidden md:block md:group-hover:hidden font-mono text-lg tracking-widest opacity-30 text-white">/// ENCRYPTED ///</div>
    </div>
  </a>
);

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
      <div className="absolute inset-0 z-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)' }} />
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />

      <div className="absolute inset-0 z-[90] pointer-events-none p-6 pb-10 md:p-12 flex flex-col justify-between text-white mix-blend-difference h-[100dvh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div></div> 
        
        {viewState !== 'detail' && (
          <div className="flex justify-between items-end pointer-events-auto w-full">
            <div className="group flex flex-col items-start gap-2 max-w-[50%] p-2 -ml-2">
              <span className="hidden md:block text-[10px] uppercase tracking-widest opacity-40">Comms & Media</span>
              <div className="flex gap-6 mt-1">
                  <a href="https://chat.whatsapp.com/GiqnDUtRKY588iiZN4SLSs" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-green-400 transition-colors">WhatsApp ↗</a>
                  <a href="https://instagram.com/feww.events" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-pink-500 transition-colors">Instagram ↗</a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-0 z-10 text-white font-sans h-[100dvh]">
        <AnimatePresence>
          {viewState === 'intro' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50, transition: { duration: 0.5 } }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.img src="/logo.png" alt="FeWW Logo" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.5, duration: 1.5 } }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3, delay: 0 } }} className="w-80 md:w-[600px] object-contain relative mix-blend-screen" />
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5, transition: { delay: 1.5, duration: 1 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className="mt-8 text-xs uppercase tracking-widest mix-blend-difference animate-pulse">
                  Scroll / Swipe to Enter
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

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
                                        /* 🔴 MASSIVELY INCREASED LOGO SIZE FOR SPINE VIEW */
                                        <motion.img layoutId={`title-${event.id}`} src="/undyed-logo.png" alt="UNDYED" className="h-24 md:h-40 lg:h-48 w-auto object-contain mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
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

        <AnimatePresence>
          {viewState === 'detail' && activeEvent && (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-auto overflow-y-auto custom-scrollbar bg-[#0a0a0a] pt-20 md:pt-28 pb-32 z-20">
              
              <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 md:gap-16 w-full min-h-full relative">
                  
                  <button onClick={() => { playClick(); onBack(); }} className="hidden md:flex absolute -top-12 left-8 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white items-center gap-2 transition-colors">
                      ← Return to Grid
                  </button>

                  <div className="w-full md:w-5/12 shrink-0 md:sticky md:top-18 h-auto md:h-[calc(100vh-12rem)]">
                      <div className="w-full aspect-[4/5] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl">
                          <img src={`/${activeEvent.slug}-poster.jpg`} alt={activeEvent.title} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1614028560833-28fecdb7dfc4?q=80&w=1000&auto=format&fit=crop'} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                          
                      </div>
                  </div>

                  <div className="w-full md:w-7/12 flex flex-col gap-10 text-white pb-12">

                      <div className="flex flex-col gap-6">
                          {activeEvent.title === 'UNDYED' ? (
                              <motion.img layoutId={`title-${activeEvent.id}`} src="/undyed-logo.png" alt="UNDYED" className="h-28 md:h-48 object-contain object-left drop-shadow-xl" />
                          ) : (
                              <motion.h1 layoutId={`title-${activeEvent.id}`} className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter drop-shadow-lg" style={{ color: activeEvent.color }}>
                                  {activeEvent.title}
                              </motion.h1>
                          )}

                          <div className="flex flex-col gap-4 font-mono text-sm">
                              <div className="flex gap-4 items-start">
                                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">📅</div>
                                  <div className="flex flex-col">
                                      <span className="font-bold text-white">
                                          {activeEvent.title === 'UNDYED' ? 'March 21, 2026' : 
                                           activeEvent.title === 'PROTOCOL 0' ? 'February 7, 2026' : 'TBA 2026'}
                                      </span>
                                      <span className="text-white/50 text-xs mt-1">
                                          {activeEvent.title === 'UNDYED' ? '4:30 PM - 8:00 PM' : 
                                           activeEvent.title === 'PROTOCOL 0' ? '10:00 AM' : 'Awaiting Intel'}
                                      </span>
                                  </div>
                              </div>
                              <div className="flex gap-4 items-start">
                                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">📍</div>
                                  <div className="flex flex-col">
                                      <span className="font-bold text-white">
                                          {activeEvent.title === 'UNDYED' ? 'Double Dribble Turf' : 
                                           activeEvent.title === 'PROTOCOL 0' ? 'Secret Grid, Besant Nagar' : 'Classified Location'}
                                      </span>
                                      <span className="text-white/50 text-xs mt-1">
                                          {activeEvent.title === 'UNDYED' ? 'Ampa Skyone, Aminjikarai, Chennai' : 
                                           activeEvent.title === 'PROTOCOL 0' ? 'Chennai, Tamil Nadu' : 'City-wide, Chennai'}
                                      </span>
                                      {activeEvent.title === 'UNDYED' && (
                                          <a href="https://maps.google.com/?q=Ampa+Skyone+Aminjikarai" target="_blank" rel="noreferrer" className="text-[10px] text-pink-500 hover:text-pink-400 mt-2 uppercase tracking-widest">Open in Maps ↗</a>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="hidden md:block bg-[#111] border border-white/10 rounded-2xl p-6 relative">
                          <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-4">
                                  <div className="bg-black border border-white/10 rounded-lg p-3 text-center w-16 shadow-inner">
                                      <p className="text-[10px] uppercase tracking-widest text-white/50">
                                          {activeEvent.title === 'UNDYED' ? 'MAR' : activeEvent.title === 'PROTOCOL 0' ? 'FEB' : 'TBA'}
                                      </p>
                                      <p className="text-xl font-black text-white">
                                          {activeEvent.title === 'UNDYED' ? '21' : activeEvent.title === 'PROTOCOL 0' ? '07' : '--'}
                                      </p>
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm text-white">Game n Rave</p>
                                      <p className="text-xs text-white/50 mt-1">
                                          {activeEvent.title === 'UNDYED' ? '₹350' : 
                                           activeEvent.title === 'PROTOCOL 0' ? 'Event Concluded' : 'Access Locked'}
                                      </p>
                                  </div>
                              </div>
                              {activeEvent.title === 'UNDYED' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
                          </div>
                          
                          {activeEvent.title === 'UNDYED' ? (
                              <button onClick={() => { playClick(); onRegisterStart(); }} className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:brightness-110 active:scale-[0.98] shadow-lg" style={{ backgroundColor: activeEvent.color, color: '#000' }}>
                                  Register Now →
                              </button>
                          ) : (
                              <button disabled className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs border border-white/10 bg-white/5 text-white/40 cursor-not-allowed">
                                  {activeEvent.title === 'PROTOCOL 0' ? 'Registrations Closed' : 'Coming Soon'}
                              </button>
                          )}
                      </div>

                      <div className="border-t border-white/10 pt-8">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6">About Event</p>
                          <div className="text-sm text-white/80 leading-relaxed font-mono space-y-4">
                              {activeEvent.title === 'UNDYED' ? (
                                  <>
                                    <p>Post-holiday depression is a loop; we’re breaking it. We are turning the city into a survival-horror simulation because the usual 'back to reality' routine is dead.</p>
                                    <p>UNDYED is a high-stakes hunt where you must dodge the outbreak, reach the safe zone, save the city, and claim the cash prize. This isn't just another party.</p>
                                    <p>Put your name on the registry before the infection spreads through the limited slots and we close the gates for good. Don't stay an NPC.</p>
                                  </>
                              ) : (
                                  <p>{activeEvent.desc}</p>
                              )}
                          </div>
                      </div>

                      {activeEvent.title === 'UNDYED' && (
                          <>
                              <div className="border-t border-white/10 pt-8">
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6">What You'll Get</p>
                                  <ul className="space-y-4 text-sm text-white/80 font-mono">
                                      <li className="flex items-center gap-4"><span className="text-lg">☣️</span> UNDYED game entry</li>
                                      <li className="flex items-center gap-4"><span className="text-lg">🎵</span> Post-game Holi rave by DJ LILMOPARIS</li>
                                      <li className="flex items-center gap-4"><span className="text-lg">🥤</span> One complimentary survival ration (drink)</li>
                                      <li className="flex items-center gap-4"><span className="text-lg">🔥</span> The ultimate adrenaline rush</li>
                                  </ul>
                              </div>

                              <div className="border-t border-white/10 pt-8 pb-8">
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6">Event Location</p>
                                  <div className="w-full aspect-video bg-[#111] border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center pattern-diagonal-lines text-white/10 group cursor-pointer" onClick={() => window.open('https://maps.google.com/?q=Ampa+Skyone+Aminjikarai')}>
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                      <div className="relative z-10 flex flex-col items-center text-center p-4">
                                          <div className="w-12 h-12 bg-white/5 border border-white/20 rounded-full flex items-center justify-center text-2xl mb-3 shadow-lg group-hover:scale-110 transition-transform">📍</div>
                                          <p className="text-white text-sm font-bold uppercase tracking-widest">Double Dribble Turf</p>
                                          <p className="text-white/50 text-[10px] uppercase tracking-widest mt-2">Click to open map</p>
                                      </div>
                                  </div>
                              </div>
                          </>
                      )}
                      
                      <div className="h-24 md:hidden"></div>
                  </div>
              </div>

              <div className="fixed bottom-0 left-0 w-full p-4 bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50">
                  <div className="max-w-md mx-auto flex gap-3">
                      <button onClick={() => { playClick(); onBack(); }} className="w-14 shrink-0 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center text-xl transition-colors active:bg-white/10">
                          ←
                      </button>
                      
                      {activeEvent.title === 'UNDYED' ? (
                          <button onClick={() => { playClick(); onRegisterStart(); }} className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2" style={{ backgroundColor: activeEvent.color, color: '#000' }}>
                              Register Now →
                          </button>
                      ) : (
                          <button disabled className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs border border-white/10 bg-white/5 text-white/40 cursor-not-allowed">
                              {activeEvent.title === 'PROTOCOL 0' ? 'Closed' : 'Coming Soon'}
                          </button>
                      )}
                  </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};