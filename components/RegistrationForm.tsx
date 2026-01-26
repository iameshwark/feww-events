import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/AudioManager';
import { EventData } from '../App';
import { supabase } from '../utils/supabaseClient';

// 🔴 STEP 1: PASTE YOUR RAZORPAY KEY ID HERE
const RAZORPAY_KEY_ID = 'rzp_test_S8MRjLkypDx08R'; 

interface RegistrationFormProps {
  event: EventData;
  onClose: () => void;
  onProceedToPayment: (formData: any) => void;
}

// Helper: Load Razorpay Script Dynamically
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// -----------------------------------------------------------------------------
// SUB-COMPONENT: LEGAL MODAL
// -----------------------------------------------------------------------------
const LegalModal: React.FC<{ type: string; onClose: () => void }> = ({ type, onClose }) => (
  <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-8" onClick={onClose}>
    <div className="max-w-md w-full border border-white/20 p-8 bg-black overflow-y-auto max-h-[80vh]" onClick={e => e.stopPropagation()}>
      <h3 className="text-xl font-bold uppercase text-white mb-4">{type}</h3>
      <div className="text-xs text-white/60 font-mono space-y-4 leading-relaxed">
        <p>This is a standard legal placeholder for {type}.</p>
        <p>1. PARTICIPANT SAFETY: By agreeing, you acknowledge that treasure hunts involve physical movement and real-world navigation. You assume all risks.</p>
        <p>2. LIABILITY: FeWW and its organizers are not liable for any injury, loss of property, or getting lost in the city during the event.</p>
        <p>3. DATA: Your data is used solely for event coordination and will not be sold to third-party ad networks.</p>
        <p>4. MEDIA: You consent to being photographed or filmed during the event for promotional purposes.</p>
        <p className="opacity-50">[In a production app, replace this text with your actual legal counsel's approved copy.]</p>
      </div>
      <button onClick={onClose} className="mt-8 w-full py-3 border border-white text-white uppercase text-xs font-bold hover:bg-white hover:text-black transition-all">
        I Understand
      </button>
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

const createEmptyMember = () => ({ name: '', email: '', phone: '' });

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ event, onClose, onProceedToPayment }) => {
  // --- STATE ---
  const [teamSize, setTeamSize] = useState<number>(1); 
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([createEmptyMember()]);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [legalOpen, setLegalOpen] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(''); // Feedback text

  const playClick = () => audioManager.playClick();
  const playHover = () => audioManager.playHover();

  // Handle Size Change
  const handleSizeChange = (size: number) => {
    playClick();
    setTeamSize(size);
    const newMembers = Array(size).fill(null).map((_, i) => members[i] || createEmptyMember());
    setMembers(newMembers);
    setErrors({});
  };

  // Handle Input Change
  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  // VALIDATION ENGINE
  const validateForm = () => {
    let isValid = true;
    const newErrors: {[key: string]: string} = {};

    if (teamSize > 1 && !teamName.trim()) { newErrors['teamName'] = 'PLEASE ENTER A TEAM NAME'; isValid = false; }

    members.forEach((member, index) => {
      if (!member.name.trim()) { newErrors[`${index}-name`] = 'NAME IS REQUIRED'; isValid = false; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(member.email)) { newErrors[`${index}-email`] = 'ENTER A VALID EMAIL ADDRESS'; isValid = false; }
      const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(member.phone)) { newErrors[`${index}-phone`] = 'ENTER A VALID 10-DIGIT MOBILE NUMBER'; isValid = false; }
    });

    if (!agreed) { newErrors['terms'] = 'REQUIRED'; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  // --- HANDLE PAYMENT & SUBMISSION ---
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    playClick();
    setIsSubmitting(true);
    setStatusMsg('INITIALIZING SECURE PROTOCOL...');

    try {
        // 1. Load Razorpay SDK
        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsSubmitting(false);
            return;
        }

        // 2. Save to Supabase (Status: Initiated)
        setStatusMsg('SAVING ROSTER DATA...');
        const { data: dbData, error: dbError } = await supabase
        .from('registrations')
        .insert([{ 
            event_title: event.title,
            team_name: teamSize > 1 ? teamName : 'SOLO ENTRY',
            team_size: teamSize,
            captain_name: members[0].name,
            captain_email: members[0].email,
            captain_phone: members[0].phone,
            members: members,
            status: 'initiated', // Initial status
            amount_paid: 0
        }])
        .select();

        if (dbError) throw dbError;
        const registrationId = dbData[0].id;

        // 3. Open Razorpay
        setStatusMsg('ESTABLISHING PAYMENT GATEWAY...');
        
        // CALCULATE AMOUNT (Example: 500 Rupees per person)
        // You can change this logic!
        const PRICE_PER_PERSON = 499; 
        const totalAmount = PRICE_PER_PERSON * teamSize;

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: totalAmount * 100, // Amount is in paise (50000 = 500 Rupees)
            currency: "INR",
            name: "FeWW Events",
            description: `Entry for ${event.title}`,
            image: "https://your-logo-url.com/logo.png", // Optional: Add your logo URL here
            handler: async function (response: any) {
                // 4. ON SUCCESS: Update Supabase
                setStatusMsg('VERIFYING TRANSACTION...');
                
                await supabase
                    .from('registrations')
                    .update({ 
                        status: 'paid', 
                        payment_id: response.razorpay_payment_id,
                        amount_paid: totalAmount
                    })
                    .eq('id', registrationId);

                alert(`REGISTRATION SUCCESSFUL!\nWelcome to the Protocol.\nTransaction ID: ${response.razorpay_payment_id}`);
                onClose(); // Close form
            },
            prefill: {
                name: members[0].name,
                email: members[0].email,
                contact: members[0].phone
            },
            theme: {
                color: event.color
            }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
        setIsSubmitting(false); // Stop loading so they can interact with popup

    } catch (err: any) {
        console.error('Error:', err);
        alert("TRANSACTION FAILED: Could not initiate sequence. Check console.");
        setIsSubmitting(false);
        setStatusMsg('');
    }
  };

  const inputBaseStyle = "w-full bg-transparent border-b py-2 text-white outline-none transition-colors placeholder:text-white/40 placeholder:text-xs placeholder:uppercase placeholder:tracking-widest";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-black border border-white/10 shadow-2xl my-8 flex flex-col max-h-[90vh]"
      >
        <div className="absolute top-0 left-0 w-full h-1 shadow-[0_0_15px_rgba(0,0,0,1)]" style={{ backgroundColor: event.color, boxShadow: `0 0 20px ${event.color}` }} />

        <div className="flex justify-between items-start p-8 pb-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter text-white">
              {teamSize === 1 ? 'Solo Registration' : 'Squad Registration'}
            </h2>
            <p className="text-xs font-mono text-white/50 tracking-widest mt-1">
              PROTOCOL: {event.title}
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">[CLOSE]</button>
        </div>

        <div className="p-8 pt-0 overflow-y-auto custom-scrollbar">
          <form onSubmit={handlePayment} className="flex flex-col gap-8">
            
            {/* SQUAD SIZE SELECTOR */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Select Squad Size</label>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    className={`flex-1 py-3 border transition-all duration-300 ${
                      teamSize === size 
                        ? 'bg-white text-black border-white font-bold' 
                        : 'bg-transparent text-white/50 border-white/10 hover:border-white/40'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* TEAM NAME */}
            <AnimatePresence>
              {teamSize > 1 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="group relative pt-4">
                    <input 
                      type="text" 
                      placeholder="TEAM IDENTITY / NAME"
                      value={teamName}
                      onChange={(e) => { setTeamName(e.target.value); if(errors['teamName']) setErrors({...errors, teamName: ''}) }}
                      className={`w-full bg-transparent border-b py-2 text-2xl font-bold uppercase tracking-wider text-white outline-none transition-colors placeholder:text-white/40 ${errors['teamName'] ? 'border-red-500 placeholder:text-red-500' : 'border-white/20 focus:border-white'}`}
                    />
                    {errors['teamName'] && <p className="absolute -bottom-4 left-0 text-[10px] text-red-500 font-bold tracking-widest animate-pulse">{errors['teamName']}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MEMBERS LIST */}
            <div className="space-y-8">
              {members.map((member, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 border border-white/5 bg-white/[0.02]"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/60 font-mono">
                      {index === 0 ? (teamSize === 1 ? 'OPERATIVE' : 'CAPTAIN') : `MEMBER 0${index + 1}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 relative">
                      <input 
                        type="text" placeholder="FULL NAME" value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        className={`${inputBaseStyle} ${errors[`${index}-name`] ? 'border-red-500' : 'border-white/20 focus:border-white'}`}
                      />
                      {errors[`${index}-name`] && <p className="absolute -bottom-4 left-0 text-[9px] text-red-500 font-bold tracking-widest">{errors[`${index}-name`]}</p>}
                    </div>
                    
                    <div className="relative">
                      <input 
                        type="email" placeholder="EMAIL ADDRESS" value={member.email}
                        onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                        className={`${inputBaseStyle} ${errors[`${index}-email`] ? 'border-red-500' : 'border-white/20 focus:border-white'}`}
                      />
                      {errors[`${index}-email`] && <p className="absolute -bottom-4 left-0 text-[9px] text-red-500 font-bold tracking-widest">{errors[`${index}-email`]}</p>}
                    </div>
                    
                    <div className="relative">
                      <input 
                        type="tel" placeholder="PHONE (+91)" value={member.phone}
                        onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                        className={`${inputBaseStyle} ${errors[`${index}-phone`] ? 'border-red-500' : 'border-white/20 focus:border-white'}`}
                      />
                      {errors[`${index}-phone`] && <p className="absolute -bottom-4 left-0 text-[9px] text-red-500 font-bold tracking-widest">{errors[`${index}-phone`]}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* TERMS & CONDITIONS */}
            <div className={`p-4 border ${errors['terms'] ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5'} transition-colors`}>
                <label className="flex items-start gap-4 cursor-pointer">
                    <div className="relative pt-1">
                        <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); if(errors['terms']) setErrors({...errors, terms: ''}); }} className="peer sr-only" />
                        <div className={`w-5 h-5 border border-white/40 peer-checked:bg-white peer-checked:border-white transition-all flex items-center justify-center`}>
                            {agreed && <div className="w-3 h-3 bg-black" />}
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-white/70 leading-relaxed uppercase tracking-wide">
                            I confirm that I am above 18 years of age and I agree to the 
                            <button type="button" onClick={() => setLegalOpen('Terms & Conditions')} className="underline text-white cursor-pointer hover:text-white/80 mx-1">Terms & Conditions</button>, 
                            <button type="button" onClick={() => setLegalOpen('Privacy Policy')} className="underline text-white cursor-pointer hover:text-white/80 mx-1">Privacy Policy</button>, and 
                            <button type="button" onClick={() => setLegalOpen('Liability Waiver')} className="underline text-white cursor-pointer hover:text-white/80 mx-1">Liability Waiver</button> 
                            for the <span className="font-bold text-white ml-1"> {event.title} </span> event.
                        </p>
                        {errors['terms'] && <p className="text-[10px] text-red-500 font-bold mt-2 tracking-widest animate-pulse">[!] YOU MUST ACCEPT THE PROTOCOLS TO PROCEED</p>}
                    </div>
                </label>
            </div>

            {/* ACTION BUTTON */}
            <div className="mt-2">
                <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onMouseEnter={playHover}
                >
                {isSubmitting ? 'PROCESSING...' : `INITIATE PAYMENT ( ₹${499 * teamSize} ) \u2192`}
                </button>
                {statusMsg && (
                    <p className="text-[10px] text-center mt-2 text-white/50 font-mono animate-pulse uppercase tracking-widest">
                        [{statusMsg}]
                    </p>
                )}
            </div>
          </form>
        </div>
      </motion.div>

      {legalOpen && <LegalModal type={legalOpen} onClose={() => setLegalOpen(null)} />}
    </motion.div>
  );
};