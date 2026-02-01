import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

const WA_LINK = "https://chat.whatsapp.com/GiqnDUtRKY588iiZN4SLSs";

export const MembershipModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    // ⏳ 2-Second Timer
    const timer = setTimeout(() => {
      // Check if they already joined
      const hasJoined = localStorage.getItem('feww_member_joined');
      if (!hasJoined) {
        setIsVisible(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Save to Supabase
    const { error } = await supabase.from('community_leads').insert([
      { 
        name: formData.name, 
        email: formData.email, 
        phone: formData.phone,
        type: 'registered_user' 
      }
    ]);

    if (error) {
      console.error('Error saving user:', error);
    }

    // 2. Mark as joined
    localStorage.setItem('feww_member_joined', 'true');

    // 3. Redirect to WhatsApp
    window.location.href = WA_LINK;
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        // Mobile: Top (pt-24), Desktop: Center
        <div className="fixed inset-0 z-[100] flex items-start pt-24 md:pt-0 md:items-center justify-center p-4 md:p-0">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -50, opacity: 0 }}
            // 🟢 CHANGED: Restored Gold Border and Shadow
            className="relative w-full max-w-md bg-[#0a0a0a] border border-[#ffd700]/30 rounded-xl p-6 md:p-8 shadow-[0_0_50px_rgba(255,215,0,0.15)] overflow-hidden"
          >
            {/* 🟢 CHANGED: Top Line is Gold */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ffd700]" />
            
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-xs uppercase tracking-widest"
            >
              [CLOSE]
            </button>

            <div className="mb-6">
              {/* 🟢 CHANGED: Title is Gold */}
              <h2 className="text-3xl font-black uppercase tracking-tighter text-[#ffd700] mb-2">
                Sign up
              </h2>
              <p className="text-xs text-white/60 leading-relaxed font-mono">
                Join the community to get early access to events and exclusive updates.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input 
                required
                type="text" 
                placeholder="FULL NAME"
                // 🟢 CHANGED: Focus border is Gold
                className="bg-white/5 border border-white/10 p-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ffd700] transition-colors uppercase tracking-widest"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <input 
                required
                type="email" 
                placeholder="EMAIL ADDRESS"
                className="bg-white/5 border border-white/10 p-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ffd700] transition-colors uppercase tracking-widest"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <input 
                required
                type="tel" 
                placeholder="PHONE NUMBER"
                className="bg-white/5 border border-white/10 p-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ffd700] transition-colors uppercase tracking-widest"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />

              <button 
                type="submit" 
                disabled={loading}
                // 🟢 CHANGED: Button is Gold with Black Text
                className="mt-2 bg-[#ffd700] text-black font-bold uppercase tracking-widest py-4 hover:bg-white transition-colors flex justify-center items-center gap-2"
              >
                {loading ? 'PROCESSING...' : 'REGISTER & JOIN \u2192'}
              </button>
            </form>

            <p className="mt-4 text-[10px] text-center text-white/20 uppercase tracking-widest">
              You will be redirected to our WhatsApp Community
            </p>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};