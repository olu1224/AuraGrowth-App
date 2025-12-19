
import React from 'react';
import { CampaignOutcome, Agent } from '../types';

interface BillionDashboardProps {
  history: CampaignOutcome[];
  agents: Agent[];
  totalTasks: number;
}

const BillionDashboard: React.FC<BillionDashboardProps> = ({ history, agents, totalTasks }) => {
  const estValue = history.length * 15000;
  const efficiencyGain = totalTasks > 0 ? 98 : 0;
  const activeSwarmCapacity = agents.length * 25;

  return (
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-block aura-gradient px-4 py-1 rounded-full text-[10px] font-bold text-white tracking-[0.3em] uppercase mb-4">
          Solo Billion Model
        </div>
        <h2 className="text-5xl md:text-7xl font-bold brand-font leading-tight text-black dark:text-white">
          Executive <span className="text-transparent bg-clip-text aura-gradient">Dashboard.</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
          Tracking the trajectory of a solo-operator business powered by autonomous agentic swarms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card rounded-[2.5rem] p-10 text-center space-y-2 border-purple-500/20">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Estimated Value Created</div>
          <div className="text-5xl font-bold text-black dark:text-white">${estValue.toLocaleString()}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+12.4% vs last epoch</div>
        </div>
        <div className="glass-card rounded-[2.5rem] p-10 text-center space-y-2 border-blue-500/20">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Efficiency Multiplier</div>
          <div className="text-5xl font-bold text-black dark:text-white">{efficiencyGain}x</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-bold">Autonomous throughput peak</div>
        </div>
        <div className="glass-card rounded-[2.5rem] p-10 text-center space-y-2 border-pink-500/20">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Swarm Active Load</div>
          <div className="text-5xl font-bold text-black dark:text-white">{activeSwarmCapacity}%</div>
          <div className="text-xs text-pink-600 dark:text-pink-400 font-bold">Scaling bandwidth available</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-[2rem] p-8 space-y-6">
          <h3 className="text-2xl font-bold brand-font text-black dark:text-white">Revenue Trajectory</h3>
          <div className="h-64 flex items-end justify-between gap-1">
             {[20, 35, 30, 50, 45, 60, 55, 75, 70, 90, 85, 100].map((h, i) => (
               <div key={i} className="flex-1 bg-black/5 dark:bg-white/5 rounded-t-lg relative group overflow-hidden h-full">
                 <div 
                   className="absolute bottom-0 left-0 right-0 aura-gradient opacity-40 group-hover:opacity-100 transition-all duration-500"
                   style={{ height: `${h}%` }}
                 ></div>
               </div>
             ))}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <span>Jan</span>
            <span>Scale Target: $1B</span>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-8 space-y-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full"></div>
          <h3 className="text-2xl font-bold brand-font mb-4 text-black dark:text-white">ASB Maturity Score</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                <span>Agent Autonomy</span>
                <span>92%</span>
              </div>
              <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full">
                <div className="h-full aura-gradient w-[92%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                <span>Error Resistance</span>
                <span>99.4%</span>
              </div>
              <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full">
                <div className="h-full bg-emerald-500 w-[99.4%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                <span>Model Alignment</span>
                <span>88%</span>
              </div>
              <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full">
                <div className="h-full bg-blue-500 w-[88%] rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
             <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
               "Your swarm is currently operating at 400x human throughput. The solo billion-dollar model is projected to reach milestone alpha in 14 epochs."
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillionDashboard;