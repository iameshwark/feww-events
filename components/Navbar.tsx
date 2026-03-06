import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  onOpenAccount: () => void; 
  onOpenTickets: () => void; 
}

export const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLoginClick, onLogout, onOpenAccount, onOpenTickets }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    onLogout();
  };

  const isActive = (path: string) => location.pathname === path ? 'text-white' : 'text-white/50 hover:text-white';

  return (
    <div className="fixed top-0 left-0 w-full z-[250] px-4 pt-4 md:pt-6 pointer-events-none">
      <div className="mx-auto max-w-6xl bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl md:rounded-full flex items-center justify-between p-2 md:px-4 pointer-events-auto shadow-2xl">
        
        {/* LOGO */}
        <button onClick={() => { setMobileMenuOpen(false); navigate('/'); }} className="ml-2 md:ml-4 flex flex-col items-start group">
          <span className="text-lg md:text-xl font-black tracking-tighter text-white">FeWW</span>
          <span className="text-[8px] tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">EVENTS</span>
        </button>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
          <button onClick={() => navigate('/')} className={`${isActive('/')} transition-colors`}>Home</button>
          <button onClick={() => navigate('/undyed')} className={`${isActive('/undyed')} hover:text-pink-500 transition-colors`}>Undyed</button>
          <button onClick={() => navigate('/partners')} className={`${isActive('/partners')} transition-colors`}>Partners</button>
          <button onClick={() => navigate('/contact')} className={`${isActive('/contact')} transition-colors`}>Contact</button>
        </div>

        {/* AUTH & PROFILE */}
        <div className="flex items-center gap-2">
          <button className="md:hidden text-white/60 hover:text-white p-2 text-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className="relative">
            {!isAuthenticated ? (
              <button onClick={onLoginClick} className="bg-white text-black px-4 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-neutral-300 transition-colors">
                Login
              </button>
            ) : (
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="bg-zinc-800 border border-zinc-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Profile
              </button>
            )}

            <AnimatePresence>
              {isAuthenticated && dropdownOpen && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-4 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 bg-black/50">
                    <p className="text-xs text-zinc-500 font-mono uppercase">Access Level</p>
                    <p className="text-sm font-bold text-white tracking-widest uppercase">Verified User</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setDropdownOpen(false); onOpenAccount(); }} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 rounded-lg transition-colors flex justify-between items-center group">
                      <span>My Account</span><span className="text-zinc-600 group-hover:text-white">⚙</span>
                    </button>
                    <button onClick={() => { setDropdownOpen(false); onOpenTickets(); }} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 rounded-lg transition-colors flex justify-between items-center group">
                      <span>My Grid Tickets</span><span className="text-zinc-600 group-hover:text-white">&rarr;</span>
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate('/events'); }} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 rounded-lg transition-colors flex justify-between items-center group">
                      <span>Book New Event</span><span className="text-zinc-600 group-hover:text-white">&rarr;</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-zinc-800">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors font-mono">
                      [ Disconnect ]
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      <AnimatePresence>
          {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden mt-2 mx-auto max-w-6xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-4 pointer-events-auto">
                  <button onClick={() => { setMobileMenuOpen(false); navigate('/'); }} className={`text-left text-sm font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 ${isActive('/')}`}>Home</button>
                  <button onClick={() => { setMobileMenuOpen(false); navigate('/undyed'); }} className={`text-left text-sm font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 ${isActive('/undyed')} hover:text-pink-500`}>Undyed</button>
                  <button onClick={() => { setMobileMenuOpen(false); navigate('/partners'); }} className={`text-left text-sm font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 ${isActive('/partners')}`}>Partners</button>
                  <button onClick={() => { setMobileMenuOpen(false); navigate('/contact'); }} className={`text-left text-sm font-bold uppercase tracking-widest ${isActive('/contact')}`}>Contact</button>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};