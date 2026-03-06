import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

export const ScannerHQ: React.FC = () => {
  const [ticketData, setTicketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (result: string) => {
    if (loading || ticketData || error) return; 
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from('event_registrations')
      .select('*, profiles:user_id (full_name, phone)')
      .eq('id', result)
      .single();

    if (fetchError || !data) {
      setError("INVALID OR FAKE TICKET PROTOCOL");
    } else {
      setTicketData(data);
    }
    setLoading(false);
  };

  const resetScanner = () => {
    setTicketData(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black text-white flex flex-col font-mono">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-black uppercase tracking-widest">Gate Scanner</h1>
        <button onClick={() => navigate('/')} className="text-zinc-500 uppercase text-xs border border-zinc-800 px-3 py-2">Exit</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative p-4">
        {loading && <div className="text-animate-pulse">Decrypting...</div>}

        {!ticketData && !error && !loading && (
          <div className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-zinc-800 bg-zinc-900">
            <Scanner onResult={(text) => handleScan(text)} />
          </div>
        )}

        {ticketData && ticketData.status === 'verified' && (
          <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center p-6 text-black">
            <h1 className="text-5xl font-black uppercase mb-2">Verified</h1>
            <p className="text-xl font-bold mb-8">Clear to Enter</p>
            <button onClick={resetScanner} className="bg-black text-white px-8 py-4 w-full font-bold uppercase rounded-xl">Next Scan</button>
          </div>
        )}

        {ticketData && ticketData.status === 'pending' && (
          <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center p-6 text-white">
            <h1 className="text-4xl font-black uppercase mb-2">Pending</h1>
            <p className="text-sm font-bold mb-8">Payment Unverified</p>
            <button onClick={resetScanner} className="bg-white text-red-600 px-8 py-4 w-full font-bold uppercase rounded-xl">Dismiss</button>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-6 text-yellow-500">
             <h1 className="text-4xl font-black uppercase mb-4 border border-yellow-500 p-2">Invalid</h1>
             <button onClick={resetScanner} className="bg-yellow-500 text-black px-8 py-4 w-full font-bold uppercase">Reset</button>
          </div>
        )}
      </div>
    </div>
  );
};