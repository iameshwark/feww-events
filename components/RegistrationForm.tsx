import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventData } from '../App';
import { supabase } from '../utils/supabaseClient';

interface RegistrationFormProps {
  event: EventData;
  onClose: () => void;
  onSuccess: () => void; // 🔴 NEW: Tells the app to open the ticket modal
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ event, onClose, onSuccess }) => {
  const [peopleCount, setPeopleCount] = useState(1);
  const [maleCount, setMaleCount] = useState(1);
  const [femaleCount, setFemaleCount] = useState(0);
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomQr, setZoomQr] = useState(false);
  
  const pricePerTicket = 350;
  const totalAmount = peopleCount * pricePerTicket;
  
  const upiId = "9035401456-2@ybl"; 
  const upiLink = `upi://pay?pa=${upiId}&pn=FeWW%20Events&am=${totalAmount}&cu=INR`;

  const mathError = (maleCount + femaleCount) !== peopleCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mathError) return;
    
    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
        alert("Authentication error. Please sign in again.");
        setIsSubmitting(false);
        return;
    }

    const ticketData = { 
        user_id: userId,
        event_id: event.id, 
        people_count: peopleCount, 
        male_count: maleCount, 
        female_count: femaleCount, 
        total_amount: totalAmount, 
        utr_number: utr,
        status: 'pending' // Defaults to pending until you verify UTR
    };

    const { error: insertError } = await supabase.from('event_registrations').insert([ticketData]);
    setIsSubmitting(false);

    if (insertError) {
      alert(`Transmission failed: ${insertError.message}`);
      return;
    }

    // Trigger the Ticket Modal instead of just closing
    onSuccess();
  };

  return (
    <>
      <AnimatePresence>
        {zoomQr && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomQr(false)} className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 cursor-pointer">
            <p className="text-white font-bold mb-6 text-xl tracking-widest uppercase">Scan to Pay ₹{totalAmount}</p>
            <img src="/qr-code.png" alt="Zoomed QR" className="w-72 h-72 bg-white p-2 border-2 border-zinc-700" />
            <p className="text-zinc-400 mt-6 font-mono text-lg">{upiId}</p>
            <p className="text-zinc-600 mt-8 text-xs tracking-widest uppercase animate-pulse">[ Tap anywhere to close ]</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔴 FIXED: Changed items-center to items-start with pt-28 and pb-20. It will now scroll properly on desktop. */}
      <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/90 p-4 pt-28 pb-20 backdrop-blur-sm overflow-y-auto custom-scrollbar">
        
        {/* 🔴 FIXED: Added my-auto and shrink-0 to prevent cutoff */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 w-full max-w-md text-white relative shadow-2xl my-auto shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center bg-black/50 rounded-full">✕</button>

          <h2 className="text-2xl font-bold mb-1 uppercase tracking-wider pr-8" style={{ color: event.color }}>Secure Grid Access</h2>
          <p className="text-sm text-zinc-400 mb-6 font-mono">{event.title} // Booking Portal</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... Rest of your form exactly as before ... */}
            <div className="space-y-4 bg-black p-4 border border-zinc-800">
              <div>
                  <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">Total Personnel</label>
                  <select value={peopleCount} onChange={(e) => setPeopleCount(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-white font-mono">
                      {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'Person' : 'People'}</option>)}
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">Male</label>
                      <input type="number" min="0" required value={maleCount} onChange={(e) => setMaleCount(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white font-mono text-center" />
                  </div>
                  <div>
                      <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">Female</label>
                      <input type="number" min="0" required value={femaleCount} onChange={(e) => setFemaleCount(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white font-mono text-center" />
                  </div>
              </div>
              {mathError && <div className="border border-red-500/50 bg-red-500/10 p-3 text-center"><p className="text-red-400 text-xs font-mono">ERROR: Male + Female must equal {peopleCount}.</p></div>}
            </div>

            <div className="bg-black p-4 border border-zinc-800 text-center relative group">
                <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4">
                    <span className="text-sm font-mono text-zinc-400">Total Amount:</span>
                    <span className="text-3xl font-black" style={{ color: event.color }}>₹{totalAmount}</span>
                </div>
                <button type="button" onClick={() => setZoomQr(true)} className="relative mx-auto block mb-2 cursor-zoom-in transition-transform hover:scale-105">
                    <img src="/qr-code.png" alt="UPI QR Code" className="w-24 h-24 mx-auto border border-zinc-700 bg-white p-1" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Tap to Enlarge</span>
                    </div>
                </button>
                <p className="text-[10px] font-mono text-zinc-500 mb-4 tracking-widest select-all">{upiId}</p>
                <a href={upiLink} className="block w-full bg-zinc-800 text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 border border-zinc-700">Pay via UPI App</a>
            </div>

            <div className="pt-2">
              <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-widest">Enter 12-Digit UTR *</label>
              <input type="text" placeholder="e.g. 304512984712" required minLength={12} maxLength={12} className="w-full bg-black border border-zinc-800 p-3 text-white focus:outline-none focus:border-white font-mono text-sm uppercase" value={utr} onChange={e => setUtr(e.target.value.replace(/\D/g, ''))} />
            </div>

            <button type="submit" disabled={isSubmitting || mathError} className="w-full mt-6 p-4 text-black font-black uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed" style={{ backgroundColor: event.color }}>
              {isSubmitting ? 'Processing...' : 'Submit Transmission'}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
};