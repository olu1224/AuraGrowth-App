
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="w-12 h-12 aura-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col -space-y-1">
        <span className="text-2xl font-black tracking-tighter text-white brand-font uppercase">Aura<span className="text-purple-500">Growth</span></span>
      </div>
    </div>
  );
};

export default Logo;
