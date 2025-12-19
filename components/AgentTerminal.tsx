
import React, { useEffect, useRef } from 'react';
import { AgentActivity } from '../types';

interface AgentTerminalProps {
  activities: AgentActivity[];
}

const AgentTerminal: React.FC<AgentTerminalProps> = ({ activities }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'RESEARCHER': return 'text-blue-500 dark:text-blue-400';
      case 'STRATEGIST': return 'text-purple-500 dark:text-purple-400';
      case 'COPYWRITER': return 'text-pink-500 dark:text-pink-400';
      case 'DESIGNER': return 'text-emerald-500 dark:text-emerald-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 h-64 flex flex-col">
      <div className="flex items-center gap-2 mb-3 border-b border-black/10 dark:border-white/10 pb-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest ml-2">Agent Execution Log</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs space-y-2">
        {activities.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-600 italic">Waiting for agents to initialize...</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="animate-in fade-in duration-300">
              <span className="text-gray-500 dark:text-gray-600">[{new Date(activity.timestamp).toLocaleTimeString()}]</span>{' '}
              <span className={`${getRoleColor(activity.role)} font-bold`}>{activity.role}</span>:{' '}
              <span className="text-gray-700 dark:text-gray-300">{activity.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentTerminal;