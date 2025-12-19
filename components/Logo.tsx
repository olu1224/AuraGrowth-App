
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 aura-gradient rounded-xl rotate-12 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-black rounded-full shadow-sm"></div>
      </div>
      <span className="text-2xl font-bold tracking-tight text-black dark:text-white brand-font">Aura<span className="text-purple-400">Growth</span></span>
    </div>
  );
};

export default Logo;