import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'initial' | 'email' | 'otp'>('initial');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- GOOGLE OAUTH ---
  const handleOAuthLogin = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/undyed/register` 
      }
    });
    if (error) alert(`Login failed: ${error.message}`);
  };

  // --- EMAIL OTP TRIGGER ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    });

    setIsLoading(false);

    if (error) {
      alert(`Error sending transmission: ${error.message}`);
    } else {
      setStep('otp');
    }
  };

  // --- EMAIL OTP VERIFICATION ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    });

    setIsLoading(false);

    if (error) {
      alert(`Access Denied: ${error.message}`);
    } else if (data.session) {
      onSuccess(); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-800 p-8 w-full max-w-md text-white relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl">✕</button>

        <h2 className="text-2xl font-black mb-2 uppercase tracking-wider text-white">
          Identify Yourself
        </h2>
        <p className="text-sm text-zinc-400 mb-8 font-mono">
          Sign in to access secure event registration and view your coordinates.
        </p>

        {step === 'initial' && (
          <div className="space-y-4">
            <button 
              onClick={() => handleOAuthLogin('google')} 
              className="w-full flex items-center justify-center gap-3 bg-white text-black p-3 font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
            
            <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs font-mono uppercase">Or Protocol</span>
                <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <button 
              onClick={() => setStep('email')}
              className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors"
            >
              Use Email Code
            </button>
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full bg-black border border-zinc-800 p-3 text-white focus:outline-none focus:border-white font-mono text-sm"
              onChange={e => setEmail(e.target.value)}
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black mt-4 p-3 font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Transmitting...' : 'Send Code'}
            </button>
            <button type="button" onClick={() => setStep('initial')} className="w-full text-xs text-zinc-500 mt-4 uppercase tracking-widest hover:text-white">&larr; Back</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
             <p className="text-xs text-zinc-400 font-mono mb-4 text-center">Enter the 6-digit code sent to {email}</p>
            <input 
              type="text" 
              placeholder="0 0 0 0 0 0" 
              required
              maxLength={6}
              className="w-full bg-black border border-zinc-800 p-4 text-center text-2xl tracking-[1em] text-white focus:outline-none focus:border-white font-mono"
              onChange={e => setOtp(e.target.value)}
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black mt-4 p-3 font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify & Enter'}
            </button>
            <button type="button" onClick={() => setStep('email')} className="w-full text-xs text-zinc-500 mt-4 uppercase tracking-widest hover:text-white">&larr; Change Email</button>
          </form>
        )}
      </motion.div>
    </div>
  );
};