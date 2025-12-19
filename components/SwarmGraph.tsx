
import React from 'react';
import { AgentRole, Agent } from '../types';

interface SwarmGraphProps {
  activeRole: AgentRole | null;
  isProcessing: boolean;
  agents: Agent[];
}

const SwarmGraph: React.FC<SwarmGraphProps> = ({ activeRole, isProcessing, agents }) => {
  const nodes = [
    { id: 'RESEARCHER', label: 'Researcher', x: 20, y: 30, icon: '🔍' },
    { id: 'STRATEGIST', label: 'Strategist', x: 50, y: 50, icon: '♟️' },
    { id: 'COPYWRITER', label: 'Copywriter', x: 80, y: 30, icon: '✍️' },
    { id: 'DESIGNER', label: 'Designer', x: 80, y: 70, icon: '🎨' },
  ];

  const edges = [
    { from: 'RESEARCHER', to: 'STRATEGIST' },
    { from: 'STRATEGIST', to: 'COPYWRITER' },
    { from: 'STRATEGIST', to: 'DESIGNER' },
  ];

  const getAgentStatusData = (role: string) => {
    const agent = agents.find(a => a.role === role);
    const status = agent?.status || 'IDLE';
    const isError = agent?.statusMessage?.toLowerCase().includes('failed') || agent?.statusMessage?.toLowerCase().includes('error');
    
    if (isError) return { color: 'stroke-red-500 fill-red-500/40', glow: 'shadow-red-500/50', animate: '' };
    
    switch (status) {
      case 'ACTIVE':
        return { 
          color: 'stroke-purple-400 fill-purple-500/50', 
          glow: 'shadow-purple-500/50', 
          animate: '' 
        };
      case 'BUSY':
        return { 
          color: 'stroke-yellow-400 fill-yellow-500/30', 
          glow: 'shadow-yellow-500/50', 
          animate: '' 
        };
      case 'IDLE':
      default:
        return { 
          color: 'stroke-gray-700 fill-gray-800/40', 
          glow: 'shadow-transparent', 
          animate: '' 
        };
    }
  };

  return (
    <div className="w-full aspect-[16/9] glass-card rounded-3xl p-6 relative overflow-hidden group">
      <div className="absolute top-4 left-6 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-purple-500' : 'bg-gray-600'}`}></div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Neural Swarm Topology</span>
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#374151" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from)!;
          const toNode = nodes.find(n => n.id === edge.to)!;
          const fromAgent = agents.find(a => a.role === edge.from);
          const isActiveEdge = fromAgent?.status === 'ACTIVE' || (activeRole === edge.from && isProcessing);
          
          return (
            <g key={`edge-${i}`}>
              <line
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke={isActiveEdge ? '#a855f7' : '#1f2937'}
                strokeWidth={isActiveEdge ? "0.6" : "0.3"}
                strokeDasharray={isActiveEdge ? "2,2" : "0"}
                markerEnd="url(#arrow)"
                className="transition-all duration-700"
              />
              {isActiveEdge && (
                <circle r="0.5" fill="#a855f7" filter="url(#glow)">
                  <animateMotion
                    dur="1.5s"
                    repeatCount="indefinite"
                    path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const statusData = getAgentStatusData(node.id);
          const isActive = activeRole === node.id;
          
          return (
            <g key={node.id} className="transition-all duration-700">
              {/* Main Node Body */}
              <circle
                cx={node.x} cy={node.y} r="6.5"
                className={`transition-all duration-500 stroke-[0.8] ${statusData.color}`}
                style={{ filter: isActive ? 'url(#glow)' : 'none' }}
              />

              {/* Central Indicator */}
              <circle
                cx={node.x} cy={node.y} r="1.5"
                className={`transition-all duration-500 ${isActive ? 'fill-white' : 'fill-gray-600'}`}
              />

              <text
                x={node.x} y={node.y + 0.5}
                textAnchor="middle" dominantBaseline="middle"
                className="text-[4px] pointer-events-none opacity-40"
              >
                {node.icon}
              </text>

              <text
                x={node.x} y={node.y + 11}
                textAnchor="middle"
                className={`text-[2.8px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'fill-purple-400' : 'fill-gray-600'}`}
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