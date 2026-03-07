import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Legal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pt-24 font-mono overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-12 flex items-center gap-2">
            &larr; Return to Grid
        </button>

        {path === '/refund-policy' && (
            <div className="space-y-6">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8">Refund Policy</h1>
                <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                    <h2 className="text-white font-bold uppercase tracking-widest mt-8">All Sales are Final</h2>
                    <p>Tickets purchased for any FeWW Events protocol or experience are strictly non-refundable. Once a transaction is verified and a ticket is issued, we do not offer cash refunds, chargebacks, or value returns under any circumstances, including personal scheduling conflicts, illness, or change of mind.</p>
                    
                    <h2 className="text-white font-bold uppercase tracking-widest mt-8">Ticket Transfers</h2>
                    <p>Tickets are highly restricted. However, if a ticket holder cannot attend, they may transfer their digital pass to another individual up to 24 hours before the event start time by contacting Operator HQ. The new attendee must agree to all standard Terms & Conditions.</p>
                    
                    <h2 className="text-white font-bold uppercase tracking-widest mt-8">Event Cancellation (Force Majeure)</h2>
                    <p>FeWW Events are experiential and often rely on specific venues or outdoor elements. In the event of severe weather, natural disasters, state emergencies, or other acts of God (Force Majeure) that force the postponement or cancellation of an event, tickets will not be refunded. Instead, all tickets will be automatically credited and transferred to the rescheduled date, or an alternative future FeWW Event of equal value.</p>
                </div>
            </div>
        )}

        {path === '/terms' && (
            <div className="space-y-6">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8">Terms & Conditions</h1>
                <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                    <h2 className="text-white font-bold uppercase tracking-widest mt-8">1. Assumption of Risk</h2>
                    <p>FeWW Events (including UNDYED, PROTOCOL 0, and 2 PIECE) are physical, immersive, experiential reality games. By purchasing a ticket and entering the event perimeter, you acknowledge that these events may involve physical exertion, running, navigating dark or crowded spaces, and survival-horror elements. You voluntarily assume all risks of personal injury, property damage, or loss that may occur during the event. FeWW Events, its organizers, and venue partners hold zero liability for any injuries or damages sustained.</p>
                    
                    <h2 className="text-white font-bold uppercase tracking-widest mt-8">2. Code of Conduct & Right of Refusal</h2>
                    <p>FeWW Events reserves the right to refuse entry or immediately eject any participant without a refund if they are found to be intoxicated, harassing staff or participants, damaging venue property, or creating an unsafe environment.</p>
                    
                    <h2 className="text-white font-bold uppercase tracking-widest mt-8">3. Media Consent & Release</h2>
                    <p>By attending a FeWW Event, you grant full, irrevocable consent to be photographed, filmed, and recorded. FeWW Events reserves the right to use this media for future marketing, promotional materials, and social media without any compensation or prior approval required from the attendee.</p>
                </div>
            </div>
        )}

        {path === '/privacy-policy' && (
            <div className="space-y-6">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8">Privacy Policy</h1>
                <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                    <h2 className="text-white font-bold uppercase tracking-widest mt-8">Data Collection</h2>
                    <p>To facilitate ticketing and gate operations, FeWW Events collects basic operational data, including your full name, phone number, email address, and UPI transaction reference numbers (UTR). We do not collect or store direct bank account details or credit card information.</p>
                    
                    <h2 className="text-white font-bold uppercase tracking-widest mt-8">Data Usage</h2>
                    <p>Your personal information is used exclusively for verifying your ticket and processing your entry at the gate, transmitting critical event updates, coordinates, and rule changes, and contacting you regarding future FeWW Event protocols.</p>
                    
                    <h2 className="text-white font-bold uppercase tracking-widest mt-8">Data Protection</h2>
                    <p>Your data is stored on secure, encrypted databases. FeWW Events strictly does not sell, rent, or distribute your personal contact information to third-party data brokers or external marketing agencies.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};