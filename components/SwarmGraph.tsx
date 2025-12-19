
import React, { useState, useMemo } from 'react';
import { AgentRole, Agent, Task } from '../types';

interface SwarmGraphProps {
  activeRole: AgentRole | null;
  isProcessing: boolean;
  agents: Agent[];
}

const SwarmGraph: React.FC<SwarmGraphProps> = ({ activeRole, isProcessing, agents }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentRole | null>(null);

  const nodes = useMemo(() => [
    { id: 'RESEARCHER' as AgentRole, label: 'Researcher', x: 20, y: 30, icon: '🔍' },
    { id: 'STRATEGIST' as AgentRole, label: 'Strategist', x: 45, y: 50, icon: '♟️' },
    { id: 'COPYWRITER' as AgentRole, label: 'Copywriter', x: 70, y: 30, icon: '✍️' },
    { id: 'DESIGNER' as AgentRole, label: 'Designer', x: 70, y: 70, icon: '🎨' },
    { id: 'QUALITY_MANAGER' as AgentRole, label: 'Quality Manager', x: 90, y: 50, icon: '🛡️' },
  ], []);

  const edges = useMemo(() => [
    { from: 'RESEARCHER' as AgentRole, to: 'STRATEGIST' as AgentRole },
    { from: 'STRATEGIST' as AgentRole, to: 'COPYWRITER' as AgentRole },
    { from: 'STRATEGIST' as AgentRole, to: 'DESIGNER' as AgentRole },
    { from: 'COPYWRITER' as AgentRole, to: 'QUALITY_MANAGER' as AgentRole },
    { from: 'DESIGNER' as AgentRole, to: 'QUALITY_MANAGER' as AgentRole },
  ], []);

  const neighbors = useMemo(() => {
    if (!selectedAgentId) return new Set<AgentRole>();
    const n = new Set<AgentRole>([selectedAgentId]);
    edges.forEach(edge => {
      if (edge.from === selectedAgentId) n.add(edge.to);
      if (edge.to === selectedAgentId) n.add(edge.from);
    });
    return n;
  }, [selectedAgentId, edges]);

  const getAgentStatusData = (role: string) => {
    const agent = agents.find(a => a.role === role);
    const status = agent?.status || 'IDLE';
    const isError = agent?.statusMessage?.toLowerCase().includes('failed') || agent?.statusMessage?.toLowerCase().includes('error');
    
    if (isError) return { color: 'stroke-red-500 fill-red-500/40', glow: 'shadow-red-500/50' };
    
    switch (status) {
      case 'ACTIVE':
        return { 
          color: 'stroke-purple-400 fill-purple-500/50', 
          glow: 'shadow-purple-500/50'
        };
      case 'BUSY':
        return { 
          color: 'stroke-yellow-400 fill-yellow-500/30', 
          glow: 'shadow-yellow-500/50'
        };
      case 'IDLE':
      default:
        return { 
          color: 'stroke-gray-400 dark:stroke-gray-700 fill-gray-200/40 dark:fill-gray-800/40', 
          glow: 'shadow-transparent'
        };
    }
  };

  const selectedAgent = agents.find(a => a.role === selectedAgentId);
  const neighborAgents = agents.filter(a => neighbors.has(a.role) && a.role !== selectedAgentId);

  return (
    <div className="w-full aspect-[16/9] glass-card rounded-[3rem] p-8 relative overflow-hidden group border-white/5 shadow-2xl">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="absolute top-6 left-8 z-10 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-purple-500 animate-pulse' : 'bg-slate-700'}`}></div>
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Swarm Topology</span>
      </div>

      {selectedAgent && (
        <div className="absolute top-0 right-0 w-80 h-full bg-[#0F172A]/90 backdrop-blur-2xl border-l border-white/10 p-8 z-20 animate-in slide-in-from-right duration-500 overflow-y-auto custom-scrollbar shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="font-black text-white text-xl brand-font tracking-tight">{selectedAgent.name}</h4>
              <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">{selectedAgent.role}</p>
            </div>
            <button 
              onClick={() => setSelectedAgentId(null)} 
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-500 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Primary Status</span>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${selectedAgent.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{selectedAgent.statusMessage || selectedAgent.status}</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Neural Directive Progress</span>
              <div className="space-y-2">
                {selectedAgent.tasks.map((task) => (
                  <div key={task.id} className="text-[10px] p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-start gap-3 group/task hover:border-white/20 transition-all">
                    <span className="text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed font-medium">{task.description}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest flex-shrink-0 ${task.status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-600'}`}>
                      {task.status === 'COMPLETED' ? 'OK' : '...' }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {neighborAgents.length > 0 && (
              <div className="pt-6 border-t border-white/5 space-y-3">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Active Connections</span>
                <div className="space-y-2">
                  {neighborAgents.map(neighbor => (
                    <div 
                      key={neighbor.id} 
                      onClick={() => setSelectedAgentId(neighbor.role)}
                      className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group/neighbor cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{neighbor.role}</span>
                      </div>
                      <div className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">{neighbor.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <svg viewBox="0 0 100 100" className="w-full h-full cursor-default select-none" onClick={() => setSelectedAgentId(null)}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-slate-700" />
          </marker>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from)!;
          const toNode = nodes.find(n => n.id === edge.to)!;
          const fromAgent = agents.find(a => a.role === edge.from);
          const isActiveEdge = fromAgent?.status === 'ACTIVE' || (activeRole === edge.from && isProcessing);
          const isSelectedEdge = selectedAgentId === edge.from || selectedAgentId === edge.to;
          
          const isRelevant = selectedAgentId ? neighbors.has(edge.from) && neighbors.has(edge.to) : true;
          const opacity = selectedAgentId ? (isSelectedEdge ? 1 : 0.05) : 0.6;

          return (
            <g key={`edge-${i}`} style={{ opacity }} className="transition-opacity duration-500">
              <line
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke={isActiveEdge || (isSelectedEdge && selectedAgentId) ? '#a855f7' : 'currentColor'}
                className={`${isActiveEdge ? '' : 'text-slate-800'}`}
                strokeWidth={isActiveEdge || isSelectedEdge ? "0.8" : "0.4"}
                strokeDasharray={(isActiveEdge || isSelectedEdge) ? "2,2" : "0"}
                markerEnd="url(#arrow)"
              />
              {isActiveEdge && (
                <circle r="0.6" fill="#a855f7" filter="url(#glow)">
                  <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {nodes.map((node) => {
          const statusData = getAgentStatusData(node.id);
          const isActive = activeRole === node.id;
          const isSelected = selectedAgentId === node.id;
          const isNeighbor = neighbors.has(node.id);
          const opacity = selectedAgentId ? (isNeighbor ? 1 : 0.1) : 1;
          
          return (
            <g 
              key={node.id} 
              className={`transition-all duration-500 cursor-pointer group/node ${isSelected ? 'scale-110' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAgentId(node.id);
              }}
              style={{ opacity }}
            >
              {selectedAgentId && isNeighbor && !isSelected && (
                <circle
                  cx={node.x} cy={node.y} r="8"
                  className="fill-none stroke-purple-500/20 stroke-[0.5]"
                >
                  <animate attributeName="r" from="7" to="11" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              <circle
                cx={node.x} cy={node.y} r="8"
                className={`fill-none transition-all duration-500 ${isSelected ? 'stroke-purple-500/30 stroke-1' : 'stroke-transparent'}`}
              />

              <circle
                cx={node.x} cy={node.y} r="6"
                className={`transition-all duration-500 stroke-[1] ${statusData.color} group-hover/node:stroke-white group-hover/node:stroke-[1.5]`}
                style={{ filter: isActive || isSelected ? 'url(#glow)' : 'none' }}
              />

              <circle
                cx={node.x} cy={node.y} r="1.2"
                className={`transition-all duration-500 ${isActive || isSelected ? 'fill-white' : 'fill-slate-700'}`}
              />

              <text
                x={node.x} y={node.y + 0.5}
                textAnchor="middle" dominantBaseline="middle"
                className="text-[4px] pointer-events-none opacity-50 select-none grayscale brightness-200"
              >
                {node.icon}
              </text>

              <text
                x={node.x} y={node.y + 11}
                textAnchor="middle"
                className={`text-[2.8px] font-black uppercase tracking-[0.25em] transition-all duration-500 select-none ${isActive || isSelected ? 'fill-purple-400' : 'fill-slate-600'} group-hover/node:fill-white`}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SwarmGraph;
