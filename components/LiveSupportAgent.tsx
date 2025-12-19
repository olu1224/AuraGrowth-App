
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const LiveSupportAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'agent', text: string }[]>([
    { role: 'agent', text: "Hello! I am your Swarm Concierge. I can help you optimize your Agent instructions, suggest templates, or guide you through the Author Status process. How can I assist your billion-dollar journey today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      // Always use new GoogleGenAI({ apiKey: process.env.API_KEY });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Use the Chat API for better conversation management
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are the AuraGrowth Swarm Concierge, a world-class expert in Agentic Service Businesses (ASB). 
          You help users scale solo businesses to billion-dollar valuations using AI swarms. 
          
          Key Business Facts for you to reference:
          1. ASB Model: We sell outcomes (results), not seats or hours.
          2. Swarm: A group of specialized AI agents (Researcher, Strategist, Copywriter, Designer) working together.
          3. Author Status: Users can apply to sell their swarm configurations in the Marketplace. 
          4. Payments: Authors earn a 10% royalty on every deployment. Payments are processed monthly via the Aura Ledger to connected accounts (USD/Stablecoins).
          5. Outcome Credits: Users purchase credits to run swarms. 1 Credit = 1 Campaign Outcome.
          
          Tone: Concise, professional, business-focused, slightly futuristic.`,
          temperature: 0.7,
        },
        // Provide history excluding the first greeting
        history: messages.slice(1).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: userMsg });
      const text = response.text || "The neural link is flickering. Please try again.";
      setMessages(prev => [...prev, { role: 'agent', text }]);
    } catch (error) {
      console.error("Support Agent Error:", error);
      setMessages(prev => [...prev, { role: 'agent', text: "I encountered a neural synchronization error. Please ensure your environment is configured correctly." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[300]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full aura-gradient flex items-center justify-center text-2xl shadow-2xl shadow-purple-500/40 hover:scale-110 transition-transform animate-bounce border border-white/20"
          aria-label="Open Swarm Concierge"
        >
          🧠
        </button>
      ) : (
        <div className="w-80 glass-card rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/40 animate-in slide-in-from-bottom duration-300 border border-purple-500/30">
           <div className="p-4 aura-gradient flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm shadow-inner">🤖</div>
                <div>
                   <div className="text-[10px] font-bold uppercase tracking-widest">Aura Support</div>
                   <div className="text-xs font-bold">Swarm Concierge</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">✕</button>
           </div>
           
           <div className="p-4 h-96 flex flex-col bg-white/5 dark:bg-black/20">
              <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 mb-4 scroll-smooth">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-tr-none' 
                        : 'bg-black/10 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-black/10 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                       <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                       <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                       <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for ASB advice..." 
                  className="flex-1 bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-black dark:text-white outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="w-8 h-8 rounded-xl aura-gradient flex items-center justify-center text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LiveSupportAgent;
