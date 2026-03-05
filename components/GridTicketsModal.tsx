import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';

interface GridTicketsModalProps {
  onClose: () => void;
}

export const GridTicketsModal: React.FC<GridTicketsModalProps> = ({ onClose }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Operator');
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const meta = session.user.user_metadata;
        setUserName(meta.full_name || meta.name || 'Operator');

        const { data, error } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setTickets(data);

      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        // ALWAYS turn off loading, even if it failed or found zero tickets
        setLoading(false); 
      }
    };
    fetchTickets();
  }, []);

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    const canvas = await html2canvas(ticketRef.current, { backgroundColor: '#000' });
    const link = document.createElement('a');
    link.download = 'FeWW_Grid_Access.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/95 backdrop-blur-md p-4 pt-24 pb-20 overflow-y-auto custom-scrollbar">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md my-auto">
        
        {/* --- EMPTY STATE (NO TICKETS) --- */}
        {tickets.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-8 text-center rounded-2xl shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-bold w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">✕</button>
                
                <div className="w-16 h-16 border border-zinc-700 bg-black rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                    <span className="text-zinc-500 text-2xl">∅</span>
                </div>
                <h3 className="text-white font-black uppercase tracking-widest mb-2 text-xl">No Access Passes</h3>
                <p className="text-zinc-500 font-mono text-xs mb-8">You have not secured any grid coordinates yet.</p>
                
                <button onClick={onClose} className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 text-xs hover:bg-neutral-300 transition-colors rounded-xl">
                    Browse Protocols
                </button>
            </div>
        ) : (
            /* --- ACTIVE TICKET STATE --- */
            <>
                <div className="text-center mb-6 relative">
                    <div className="w-10 h-10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-green-500 font-bold">✓</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-white italic">Your Ticket</h2>
                    <p className="text-zinc-400 text-sm mt-2">Save your pass — you'll need it at the grid.</p>
                </div>

                <div ref={ticketRef} className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-pink-500 tracking-tighter">FeWW</span>
                            <span className="text-xs font-bold tracking-[0.2em] text-white">TICKET</span>
                        </div>
                        {tickets[0].status === 'verified' ? (
                            <span className="border border-green-500/50 bg-green-500/10 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">✓ Confirmed</span>
                        ) : (
                            <span className="border border-yellow-500/50 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Pending UTR</span>
                        )}
                    </div>

                    <h1 className="text-3xl font-black text-white italic tracking-widest uppercase mb-4 relative z-10 drop-shadow-md">
                        {tickets[0].event_id === 2 ? 'UNDYED' : 'PROTOCOL 0'}
                    </h1>

                    <div className="flex flex-col gap-2 text-xs font-mono text-zinc-400 mb-6 relative z-10">
                        <p>📅 MARCH 21, 2026 🕒 6:00 PM</p>
                        <p>📍 SECRET GRID, CHENNAI</p>
                    </div>

                    <div className="flex gap-4 relative z-10">
                        <div className="bg-white p-2 rounded-xl shrink-0">
                            <QRCode value={tickets[0].id} size={100} />
                        </div>
                        <div className="flex flex-col justify-center gap-3">
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-zinc-500">Attendee</p>
                                <p className="text-sm font-bold text-white uppercase">{userName}</p>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-zinc-500">Ticket ID</p>
                                <p className="text-xs font-bold text-pink-500 uppercase">FWW-{tickets[0].id.split('-')[0]}</p>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-zinc-500">Admit</p>
                                <p className="text-sm font-bold text-white uppercase">{tickets[0].people_count} Personnel</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-zinc-700 my-6 relative z-10">
                        <div className="absolute -left-8 -top-3 w-6 h-6 bg-black rounded-full"></div>
                        <div className="absolute -right-8 -top-3 w-6 h-6 bg-black rounded-full"></div>
                    </div>

                    <div className="text-center text-[9px] uppercase tracking-[0.3em] text-zinc-600 relative z-10">
                        VALID FOR DESIGNATED ENTRY ONLY
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                    <button onClick={downloadTicket} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-colors flex justify-center items-center gap-2">
                        ↓ Save as PNG
                    </button>
                    <button onClick={onClose} className="w-full border border-zinc-800 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-colors">
                        Close System
                    </button>
                </div>
            </>
        )}

      </motion.div>
    </div>
  );
};