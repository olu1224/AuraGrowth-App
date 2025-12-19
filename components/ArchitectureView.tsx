
import React from 'react';

const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-6xl font-bold brand-font tracking-tighter">Neural <span className="text-purple-400">Blueprint</span></h2>
        <p className="text-gray-500 text-xl font-medium">
          Transforming raw data into <span className="text-emerald-500 font-bold">High-Yield Outcomes.</span>
        </p>
      </div>

      {/* Legacy vs ASB Comparison Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="glass-card rounded-[3.5rem] p-12 space-y-8 bg-red-500/5 border-red-500/10 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex justify-between items-center border-b border-red-500/10 pb-6">
             <h3 className="text-2xl font-bold text-red-500 uppercase tracking-tighter">Legacy Model</h3>
             <span className="text-[10px] font-bold text-gray-500 px-3 py-1 bg-red-500/10 rounded-full">INEFFICIENT</span>
           </div>
           <div className="space-y-6">
              {[
                { icon: "😴", title: "Human Latency", desc: "48-72 hour response times." },
                { icon: "💰", title: "High Overhead", desc: "Paying for expensive office space." },
                { icon: "📉", title: "Scale Friction", desc: "Hiring takes months, firing takes weeks." }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 items-center p-5 bg-white/5 rounded-3xl border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">{item.icon}</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white uppercase tracking-widest">{item.title}</div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="glass-card rounded-[3.5rem] p-12 space-y-8 border-purple-500/40 relative overflow-hidden group">
           <div className="absolute inset-0 aura-gradient opacity-10 blur-[120px] group-hover:opacity-20 transition-opacity"></div>
           <div className="relative z-10">
             <div className="flex justify-between items-center border-b border-purple-500/20 pb-6 mb-8">
               <h3 className="text-2xl font-bold text-purple-400 uppercase tracking-tighter">Swarm Model</h3>
               <span className="text-[10px] font-bold text-emerald-500 px-3 py-1 bg-emerald-500/10 rounded-full animate-pulse">OPTIMIZED</span>
             </div>
             <div className="space-y-6">
                {[
                  { icon: "⚡", title: "Sub-Second Sync", desc: "Agents share context instantly." },
                  { icon: "🎯", title: "Pure Outcome", desc: "Zero cost for non-delivered results." },
                  { icon: "🧠", title: "Infinite Scale", desc: "Deploy 1,000 swarms in one click." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 items-center p-5 bg-purple-500/10 rounded-3xl border border-purple-500/20 hover:scale-[1.03] transition-all cursor-default">
                    <div className="w-12 h-12 rounded-full aura-gradient flex items-center justify-center text-2xl text-white shadow-lg">{item.icon}</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white uppercase tracking-widest">{item.title}</div>
                      <p className="text-[11px] text-gray-300 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>

      <div className="glass-card rounded-[4rem] p-16 relative overflow-hidden text-center space-y-12">
        <h3 className="text-4xl font-bold brand-font text-white">The Neural Pipeline</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 relative">
           <div className="flex flex-col items-center gap-4 group">
             <div className="w-24 h-24 rounded-full bg-black/60 border-2 border-purple-500/30 flex items-center justify-center text-4xl group-hover:scale-110 transition-all shadow-2xl shadow-purple-500/20">📥</div>
             <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Strategy Ingress</span>
           </div>
           
           <div className="hidden md:block w-32 h-[2px] bg-gradient-to-r from-purple-500/50 to-emerald-500/50 relative">
              <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-white -translate-y-1/2 animate-ping"></div>
           </div>

           <div className="p-10 bg-black/60 border border-white/10 rounded-[3rem] shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                 {['🔍', '♟️', '✍️', '🎨'].map((icon, i) => (
                   <div key={i} className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-3xl hover:bg-white/10 transition-colors border border-white/5">{icon}</div>
                 ))}
              </div>
              <div className="mt-6 text-[10px] font-bold text-purple-400 uppercase tracking-[0.5em]">Collaborative Loop</div>
           </div>

           <div className="hidden md:block w-32 h-[2px] bg-gradient-to-r from-emerald-500/50 to-transparent"></div>

           <div className="flex flex-col items-center gap-4 group">
             <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-4xl group-hover:scale-110 transition-all shadow-2xl shadow-emerald-500/30">🚀</div>
             <span className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em]">Outcome Egress</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureView;
