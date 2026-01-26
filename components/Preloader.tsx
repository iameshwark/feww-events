import React from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onEnter: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onEnter }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white pointer-events-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 1 }}
        className="flex flex-col items-center gap-8"
      >
        <div className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-neutral-400">
          HEADPHONES RECOMMENDED
        </div>
        
        <button
          onClick={onEnter}
          className="group relative px-10 py-3 border border-white/20 overflow-hidden hover:border-white/60 transition-colors duration-500"
        >
          <span className="relative z-10 text-xs font-bold uppercase tracking-widest group-hover:text-black transition-colors duration-300">
            ENTER
          </span>
          <div className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </button>
      </motion.div>
    </motion.div>
  );
};