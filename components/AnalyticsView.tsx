
import React, { useMemo } from 'react';
import { Agent, CampaignOutcome } from '../types';

interface AnalyticsViewProps {
  agents: Agent[];
  totalTasksCompleted: number;
  activeCampaign?: CampaignOutcome;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ agents, totalTasksCompleted, activeCampaign }) => {
  const liveStats = useMemo(() => {
    if (!activeCampaign) return null;
    return {
      ctr: (2.4 + Math.random() * 1.5).toFixed(2),
      conversions: Math.floor(12 + Math.random() * 50),
      roas: (4.1 + Math.random() * 2.2).toFixed(1),
      spend: (120 + Math.random() * 500).toFixed(2)
    };
  }, [activeCampaign]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold brand-font">Swarm <span className="text-purple-400">Analytics</span></h2>
          <p className="text-gray-500 mt-2">
            {activeCampaign 
              ? `Currently monitoring: ${activeCampaign.name}`
              : 'Real-time performance metrics for your autonomous agency swarm.'}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl backdrop-blur-md">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Cumulative Throughput</div>
          <div className="text-3xl font-bold text-white">{totalTasksCompleted} <span className="text-xs text-purple-400 font-normal">Tasks Finished</span></div>
        </div>
      </div>

      {activeCampaign && liveStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in zoom-in-95 duration-500">
          <div className="glass-card rounded-3xl p-6 border-emerald-500/20">
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Live Click-Through (CTR)</div>
             <div className="text-3xl font-bold text-emerald-400">{liveStats.ctr}%</div>
             <div className="text-[10px] text-gray-400 mt-1 italic">Benchmarked vs Industry High</div>
          </div>
          <div className="glass-card rounded-3xl p-6 border-blue-500/20">
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Activated Conversions</div>
             <div className="text-3xl font-bold text-blue-400">{liveStats.conversions}</div>
             <div className="text-[10px] text-gray-400 mt-1 italic">Real-time outcome attribution</div>
          </div>
          <div className="glass-card rounded-3xl p-6 border-purple-500/20">
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Outcome ROAS</div>
             <div className="text-3xl font-bold text-purple-400">{liveStats.roas}x</div>
             <div className="text-[10px] text-gray-400 mt-1 italic">Return on autonomous spend</div>
          </div>
          <div className="glass-card rounded-3xl p-6 border-pink-500/20">
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Daily Run Rate</div>
             <div className="text-3xl font-bold text-pink-400">${liveStats.spend}</div>
             <div className="text-[10px] text-gray-400 mt-1 italic">Optimized by Strategist Prime</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {agents.map((agent) => {
          const completed = agent.tasks.filter(t => t.status === 'COMPLETED').length;
          const total = agent.tasks.length;
          const percent = total > 0 ? (completed / total) * 100 : 0;
          
          return (
            <div key={agent.id} className="glass-card rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:opacity-20 transition-opacity">
                {agent.role === 'RESEARCHER' ? '🔍' : agent.role === 'STRATEGIST' ? '♟️' : agent.role === 'COPYWRITER' ? '✍️' : '🎨'}
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{agent.role}</div>
              <div className="text-xl font-bold text-white mb-1 truncate">{agent.name}</div>
              <div className="text-xs text-purple-400 mb-6 font-mono">{agent.specialty}</div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                  <span>Task Saturation</span>
                  <span>{Math.round(percent)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full aura-gradient transition-all duration-1000" 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div>
                  <div className="text-[10px] font-bold text-gray-600 uppercase">Uptime</div>
                  <div className="text-lg font-bold text-emerald-400">99.9%</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-600 uppercase">Response</div>
                  <div className="text-lg font-bold text-blue-400">12ms</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card rounded-3xl p-10">
        <h3 className="text-2xl font-bold mb-8 brand-font">{activeCampaign ? 'Real-World Performance Trajectory' : 'Swarm Neural Load'}</h3>
        <div className="h-64 w-full flex items-end gap-3 px-4">
          {[40, 70, 45, 90, 65, 85, 30, 60, 95, 55, 75, 50].map((height, i) => (
            <div key={i} className="flex-1 group relative">
              <div 
                className={`w-full rounded-t-lg transition-all duration-700 hover:brightness-125 ${activeCampaign ? 'bg-emerald-500/60' : 'aura-gradient'}`}
                style={{ height: `${height}%` }}
              ></div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {height}%
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 px-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <span>{activeCampaign ? 'Market Ingress' : '00:00 - Initializing Swarm'}</span>
          <span>{activeCampaign ? 'Peak Performance Epoch' : 'Current Epoch - High Availability'}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
