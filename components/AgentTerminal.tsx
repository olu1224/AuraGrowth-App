
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { AgentActivity, AgentRole } from '../types';

interface AgentTerminalProps {
  activities: AgentActivity[];
}

type MessageTypeFilter = 'ALL' | 'LOGS' | 'OUTCOMES' | 'ERRORS';
type RoleFilter = 'ALL' | AgentRole;

const AgentTerminal: React.FC<AgentTerminalProps> = ({ activities }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<MessageTypeFilter>('ALL');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities, roleFilter, typeFilter]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const roleMatch = roleFilter === 'ALL' || activity.role === roleFilter;
      
      let typeMatch = true;
      if (typeFilter === 'LOGS') {
        typeMatch = !!activity.isLog;
      } else if (typeFilter === 'OUTCOMES') {
        typeMatch = !activity.isLog;
      } else if (typeFilter === 'ERRORS') {
        const msg = activity.message.toLowerCase();
        typeMatch = msg.includes('error') || msg.includes('failed') || msg.includes('critical');
      }

      return roleMatch && typeMatch;
    });
  }, [activities, roleFilter, typeFilter]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'RESEARCHER': return 'text-blue-500 dark:text-blue-400';
      case 'STRATEGIST': return 'text-purple-500 dark:text-purple-400';
      case 'COPYWRITER': return 'text-pink-500 dark:text-pink-400';
      case 'DESIGNER': return 'text-emerald-500 dark:text-emerald-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const roles: RoleFilter[] = ['ALL', 'RESEARCHER', 'STRATEGIST', 'COPYWRITER', 'DESIGNER'];
  const types: MessageTypeFilter[] = ['ALL', 'LOGS', 'OUTCOMES', 'ERRORS'];

  return (
    <div className="glass-card rounded-2xl p-4 h-80 flex flex-col transition-all duration-300">
      <div className="flex flex-col gap-3 mb-3 border-b border-black/10 dark:border-white/10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
            </div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest ml-2">Neural Execution Terminal</span>
          </div>
          <div className="text-[10px] font-mono text-gray-400">
            {filteredActivities.length} / {activities.length} EVENTS
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2 py-1 text-[8px] font-bold uppercase rounded-md transition-all ${
                  roleFilter === r 
                    ? 'bg-white dark:bg-white/10 text-purple-500 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-1 text-[8px] font-bold uppercase rounded-md transition-all ${
                  typeFilter === t 
                    ? 'bg-white dark:bg-white/10 text-emerald-500 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-2 pr-2">
        {filteredActivities.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-600 italic py-4 text-center">
            {activities.length === 0 ? 'Waiting for agents to initialize...' : 'No events match current filters.'}
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const isError = activity.message.toLowerCase().includes('error') || activity.message.toLowerCase().includes('failed');
            return (
              <div key={activity.id} className={`animate-in fade-in duration-300 border-l-2 pl-2 ${isError ? 'border-red-500/30' : 'border-transparent'}`}>
                <span className="text-gray-500 dark:text-gray-600">[{new Date(activity.timestamp).toLocaleTimeString()}]</span>{' '}
                <span className={`${getRoleColor(activity.role)} font-bold tracking-tighter`}>{activity.role}</span>{' '}
                <span className={`text-[8px] px-1 rounded uppercase font-bold mr-1 ${activity.isLog ? 'bg-gray-100 dark:bg-white/5 text-gray-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  {activity.isLog ? 'LOG' : 'OUTCOME'}
                </span>
                <span className={`${isError ? 'text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{activity.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AgentTerminal;
