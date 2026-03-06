import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

export const AdminHQ: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
        alert("Access Denied. You do not have admin clearance.");
        navigate('/');
    } else if (data) {
        setTickets(data);
    }
    setLoading(false);
  };

  const verifyTicket = async (id: string) => {
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'verified' })
      .eq('id', id);

    if (error) {
        alert("Verification failed: " + error.message);
    } else {
        // Refresh the list
        fetchAllTickets();
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">Loading Grid Intel...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24 font-mono custom-scrollbar overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-6 mb-8">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-widest text-white">Operator HQ</h1>
                <p className="text-zinc-500 text-sm mt-2">Ticket Verification Terminal</p>
            </div>
            <button onClick={() => navigate('/')} className="text-zinc-500 hover:text-white uppercase tracking-widest text-xs border border-zinc-800 px-4 py-2 hover:bg-zinc-900 transition-colors">
                Exit Terminal
            </button>
        </div>

        <div className="grid gap-4">
            {tickets.length === 0 && <div className="text-zinc-600">No transmissions found in the grid.</div>}
            
            {tickets.map(ticket => (
                <div key={ticket.id} className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 w-full">
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Protocol</p>
                            <p className="font-bold text-pink-500">{ticket.event_id === 2 ? 'UNDYED' : 'PROTOCOL 0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Amount / Pax</p>
                            <p className="font-bold text-white">₹{ticket.total_amount} ({ticket.people_count})</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">UTR Number</p>
                            <p className="font-bold text-yellow-500 tracking-wider select-all">{ticket.utr_number}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Status</p>
                            <p className={`font-bold uppercase tracking-widest text-xs mt-1 ${ticket.status === 'verified' ? 'text-green-500' : 'text-zinc-500 animate-pulse'}`}>
                                {ticket.status}
                            </p>
                        </div>
                    </div>

                    {ticket.status === 'pending' && (
                        <button 
                            onClick={() => verifyTicket(ticket.id)}
                            className="w-full md:w-auto px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-green-400 transition-colors shrink-0"
                        >
                            Verify UTR
                        </button>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
