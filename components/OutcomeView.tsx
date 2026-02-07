
import React, { useState, useRef, useEffect } from 'react';
import { CampaignResults } from '../types';
import { geminiService } from '../services/geminiService';

interface OutcomeViewProps {
  results: CampaignResults;
  onMonitorPerformance?: () => void;
  isActivated?: boolean;
}

const OutcomeView: React.FC<OutcomeViewProps> = ({ results, onMonitorPerformance, isActivated }) => {
  const [activeSubTab, setActiveSubTab] = useState<'Assets' | 'Intelligence' | 'Roadmap' | 'Audit'>('Assets');
  
  const [localCampaignAsset, setLocalCampaignAsset] = useState<string | undefined>(results?.campaignAsset);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(results?.videoUrl);
  const [visualUrl, setVisualUrl] = useState<string | undefined>(results?.visualUrl);
  
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerationStatus, setVideoGenerationStatus] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [targetDuration, setTargetDuration] = useState<number>(8);

  // Sync state if props change (though parent key usually handles this)
  useEffect(() => {
    if (results) {
      setVisualUrl(results.visualUrl);
      setVideoUrl(results.videoUrl);
      setLocalCampaignAsset(results.campaignAsset);
    }
  }, [results]);

  const triggerCopyFeedback = (msg: string) => {
    setCopyFeedback(msg);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleExportJSON = () => {
    if (!results) return;
    const exportData = {
      manifestId: `AG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: isActivated ? 'ACTIVE_MARKET' : 'DRAFT_STRATEGY',
      blueprint: results,
      media: {
        visualHero: visualUrl,
        motionSequence: videoUrl,
        brandAssetRef: localCampaignAsset ? 'INTEGRATED' : 'NONE'
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AuraGrowth-Blueprint-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerCopyFeedback('JSON Exported');
  };

  const handleExportManifest = () => {
    if (!results) return;
    const divider = "\n" + "=".repeat(70) + "\n";
    
    let content = `AURAGROWTH ASB | STRATEGIC OUTCOME MANIFEST\n`;
    content += `GENERATED: ${new Date().toLocaleString()}\n`;
    content += `STATUS: ${isActivated ? 'MARKET READY / ACTIVATED' : 'STRATEGIC DRAFT'}\n`;
    content += divider;
    
    content += `\n1. EXECUTIVE SUMMARY\n`;
    content += results.executiveSummary + "\n";
    
    content += divider;
    content += `\n2. MARKET INTELLIGENCE (SWOT ANALYSIS)\n`;
    content += `[STRENGTHS]:\n- ${(results.marketIntelligence?.swotAnalysis?.strengths || []).join('\n- ')}\n`;
    content += `\n[WEAKNESSES]:\n- ${(results.marketIntelligence?.swotAnalysis?.weaknesses || []).join('\n- ')}\n`;
    content += `\n[OPPORTUNITIES]:\n- ${(results.marketIntelligence?.swotAnalysis?.opportunities || []).join('\n- ')}\n`;
    content += `\n[THREATS]:\n- ${(results.marketIntelligence?.swotAnalysis?.threats || []).join('\n- ')}\n`;
    
    content += `\nCOMPETITOR VULNERABILITIES:\n- ${(results.marketIntelligence?.competitorVulnerabilities || []).join('\n- ')}\n`;
    
    content += divider;
    content += `\n3. AUDIENCE DOSSIER\n`;
    (results.audienceDossier?.icps || []).forEach((icp, i) => {
      content += `\n[PERSONA ${i+1}]: ${icp.personaName}\n`;
      content += `PAIN POINTS: ${icp.painPoints?.join(', ') || 'N/A'}\n`;
      content += `MOTIVATIONS: ${icp.motivations?.join(', ') || 'N/A'}\n`;
    });
    
    content += divider;
    content += `\n4. CORE OFFER ARCHITECTURE\n`;
    content += `HOOK: ${results.coreOfferArchitecture?.hook || 'N/A'}\n`;
    content += `TRANSFORMATION: ${results.coreOfferArchitecture?.transformation || 'N/A'}\n`;
    content += `GUARANTEE: ${results.coreOfferArchitecture?.guarantee || 'N/A'}\n`;
    
    content += divider;
    content += `\n5. MULTI-CHANNEL MESSAGING\n`;
    content += `HEADLINE: ${results.copy?.headline || 'N/A'}\n`;
    content += `BODY: ${results.copy?.body || 'N/A'}\n`;
    content += `CTA: ${results.copy?.cta || 'N/A'}\n`;
    
    content += divider;
    content += `\n6. PHASED EXECUTION ROADMAP\n`;
    (results.phasedRoadmap || []).forEach((phase, i) => {
      content += `\nPHASE 0${i+1}: ${phase.phaseName}\n`;
      content += `OBJECTIVE: ${phase.objective}\n`;
      content += `ACTIONS: ${phase.actions?.join(', ') || 'N/A'}\n`;
    });
    
    content += divider;
    content += `\n7. GUARDIAN-QC AUDIT CERTIFICATE\n`;
    content += `SCORE: ${results.auditCertificate?.score || 0}/100\n`;
    content += `READINESS: ${results.auditCertificate?.readinessStatus || 'ALPHA'}\n`;
    content += divider;
    content += `END OF MANIFEST`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AuraGrowth-Manifest-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerCopyFeedback('Manifest Exported');
  };

  const handleGenerateVideo = async () => {
    if (isGeneratingVideo || !results) return;
    setIsGeneratingVideo(true);
    setVideoError(null);
    setVideoGenerationStatus('Initializing Swarm Brain...');
    try {
      const effectiveAspectRatio = localCampaignAsset ? '16:9' : videoAspectRatio;
      const extensions = targetDuration === 15 ? 1 : targetDuration === 30 ? 3 : targetDuration === 60 ? 7 : 0;
      const willExtend = extensions > 0;

      // Enhance the prompt with duration and anti-artifact directives
      const durationDirective = `Target Duration: ${targetDuration} seconds.`;
      const artifactDirective = `DIRECTIVE: ABSOLUTELY NO TEXT, NO LOGOS, NO WATERMARKS, NO NUMERALS, NO CAPTIONS. Focus on high-fidelity visual texture and movement.`;
      const enhancedVideoPrompt = `${results.videoPrompt}. ${durationDirective} ${artifactDirective}`;

      setVideoGenerationStatus('Guardian-QC: Synthesizing Initial Segment...');
      const initialResult = await geminiService.generateCampaignVideo(enhancedVideoPrompt, effectiveAspectRatio, localCampaignAsset, willExtend);
      if (!initialResult) throw new Error("Base synthesis failed.");

      let currentRawVideo = initialResult.rawVideo;
      setVideoUrl(initialResult.url);

      for (let i = 0; i < extensions; i++) {
        setVideoGenerationStatus(`Guardian-QC: Neural Extension Phase ${i + 1}/${extensions}...`);
        const extendedResult = await geminiService.extendCampaignVideo(enhancedVideoPrompt, currentRawVideo, effectiveAspectRatio);
        if (!extendedResult) break;
        currentRawVideo = extendedResult.rawVideo;
        setVideoUrl(extendedResult.url);
      }
      setVideoGenerationStatus(`Synthesis Successfully Released.`);
    } catch (error: any) {
      console.error("Video synthesis failed:", error);
      setVideoError(error.message || "Synthesis interrupted.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const tabs = [
    { id: 'Assets' as const, label: 'Media Assets' },
    { id: 'Intelligence' as const, label: 'Strategic Dossier' },
    { id: 'Roadmap' as const, label: 'Execution Roadmap' },
    { id: 'Audit' as const, label: 'Audit Manifest' },
  ];

  if (!results) return (
    <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
      Waiting for outcome results...
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex gap-8 border-b border-white/5 pb-2 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`text-[10px] font-black uppercase tracking-[0.2em] pb-3 whitespace-nowrap transition-all relative z-10 ${
              activeSubTab === tab.id ? 'text-purple-400 opacity-100' : 'text-slate-500 opacity-60 hover:opacity-100 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {activeSubTab === tab.id && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"></span>}
          </button>
        ))}
      </div>

      <div className="min-h-[500px] w-full">
        {activeSubTab === 'Assets' && (
          <div className="grid grid-cols-12 gap-6 items-start">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="glass-card rounded-[2rem] overflow-hidden border-white/5 relative group aspect-video">
                {visualUrl ? (
                  <img src={visualUrl} alt="Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[4s]" />
                ) : (
                  <div className="w-full h-full bg-slate-800 animate-pulse flex items-center justify-center text-xs font-black uppercase text-slate-600 tracking-widest">Rendering Master Visual...</div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Cinematic Static Release</span>
                      <h4 className="text-white font-black text-sm brand-font">Hero Identity Asset</h4>
                   </div>
                   <button className="px-4 py-2 bg-white/10 text-white text-[9px] font-black uppercase rounded-lg border border-white/10 hover:bg-white/20 transition-all">Export 1K</button>
                </div>
              </div>

              <div className="glass-card rounded-[2.5rem] p-8 space-y-6 bg-slate-900/40 border-white/10">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Messaging Manifest</h4>
                  {copyFeedback && <span className="text-[8px] font-black text-emerald-400 uppercase animate-pulse">{copyFeedback}</span>}
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-bold text-slate-600 uppercase">Strategic Hook</span>
                    <p className="text-xl font-black text-white leading-tight mt-1">{results.copy?.headline || '...'}</p>
                  </div>
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[8px] font-bold text-slate-600 uppercase">Dossier Narrative</span>
                       <button onClick={() => { navigator.clipboard.writeText(results.copy?.body || ''); triggerCopyFeedback('Copied'); }} className="text-[7px] font-black text-purple-400 uppercase hover:underline">Copy Body</button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{results.copy?.body || 'Generating narrative...'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
               <div className="glass-card rounded-[2rem] overflow-hidden border-white/5 relative group bg-slate-900 flex flex-col min-h-[400px]">
                 {videoUrl ? (
                   <div className="p-4 space-y-4">
                     <video key={videoUrl} src={videoUrl} controls autoPlay muted loop playsInline className="w-full aspect-video rounded-2xl object-cover shadow-2xl border border-white/10" />
                     <div className="flex justify-between items-center px-2">
                        <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Motion Outcome Finalized</span>
                        <div className="flex gap-2">
                          <button onClick={() => setVideoUrl(undefined)} className="px-4 py-2 bg-white/5 text-slate-400 text-[9px] font-black uppercase rounded-lg border border-white/10">Re-Synthesize</button>
                          <button className="px-4 py-2 bg-pink-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg">Download 720p</button>
                        </div>
                     </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center flex-1 p-10 text-center space-y-8">
                      {isGeneratingVideo ? (
                        <div className="space-y-6">
                          <div className="relative">
                            <div className="w-16 h-16 border-2 border-purple-500/10 border-t-purple-500 animate-spin mx-auto rounded-full"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs animate-pulse">⚙️</div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Synthesizing {targetDuration}s Motion...</p>
                            <p className="text-[9px] text-slate-500 uppercase italic font-bold tracking-widest">{videoGenerationStatus}</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3">
                            <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[8px] font-black text-purple-400 uppercase tracking-widest">Advanced Motion Architecture</div>
                            <h4 className="text-2xl font-black text-white brand-font uppercase tracking-tight">Cinematic Synthesis</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">Synthesize a cinema-grade motion sequence for your brand objective. Requests longer sequences up to 60 seconds.</p>
                          </div>
                          
                          <div className="space-y-4 w-full max-w-xs">
                             <div className="flex justify-between items-center mb-1">
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Duration Profile</span>
                               <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{targetDuration}s</span>
                             </div>
                             <div className="flex justify-center gap-2">
                               {[8, 15, 30, 60].map(d => (
                                 <button key={d} onClick={() => setTargetDuration(d)} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${targetDuration === d ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}>{d}s</button>
                               ))}
                             </div>
                          </div>

                          {videoError && (
                            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-bold uppercase tracking-tight">
                              Error: {videoError}
                            </div>
                          )}

                          <button onClick={handleGenerateVideo} className="w-full py-5 aura-gradient text-white text-[12px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-2xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Deploy Motion Swarm</button>
                        </>
                      )}
                   </div>
                 )}
               </div>

               <div className="glass-card rounded-[2.5rem] p-8 space-y-6 bg-black/40 border-white/10">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audience Dossier</h4>
                 <div className="space-y-4">
                    {(results.audienceDossier?.icps || []).map((icp, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                         <h5 className="text-white font-black text-sm uppercase tracking-tighter">{icp.personaName}</h5>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <span className="text-[7px] font-black text-slate-600 uppercase">Core Pain Points</span>
                               <ul className="text-[9px] text-slate-400 mt-1 space-y-1">
                                  {(icp.painPoints || []).map((p, j) => <li key={j}>• {p}</li>)}
                               </ul>
                            </div>
                            <div>
                               <span className="text-[7px] font-black text-emerald-400 uppercase">Primary Motivations</span>
                               <ul className="text-[9px] text-slate-400 mt-1 space-y-1">
                                  {(icp.motivations || []).map((m, j) => <li key={j}>• {m}</li>)}
                               </ul>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeSubTab === 'Intelligence' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card rounded-[3rem] p-12 space-y-8 bg-slate-900/20">
                   <h3 className="text-3xl font-black text-white brand-font uppercase">Executive Summary</h3>
                   <p className="text-lg text-slate-300 leading-relaxed italic border-l-4 border-purple-500 pl-8">"{results.executiveSummary || 'Strategizing...'}"</p>
                </div>

                <div className="glass-card rounded-[3rem] p-12 space-y-8">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strategic SWOT Matrix</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-3">
                         <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Strengths</span>
                         <ul className="text-[10px] text-slate-400 space-y-2">
                            {(results.marketIntelligence?.swotAnalysis?.strengths || []).map((s, i) => <li key={i}>+ {s}</li>)}
                         </ul>
                      </div>
                      <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-3">
                         <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Opportunities</span>
                         <ul className="text-[10px] text-slate-400 space-y-2">
                            {(results.marketIntelligence?.swotAnalysis?.opportunities || []).map((o, i) => <li key={i}>↗ {o}</li>)}
                         </ul>
                      </div>
                      <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl space-y-3">
                         <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Weaknesses</span>
                         <ul className="text-[10px] text-slate-400 space-y-2">
                            {(results.marketIntelligence?.swotAnalysis?.weaknesses || []).map((w, i) => <li key={i}>- {w}</li>)}
                         </ul>
                      </div>
                      <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-3">
                         <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Threats</span>
                         <ul className="text-[10px] text-slate-400 space-y-2">
                            {(results.marketIntelligence?.swotAnalysis?.threats || []).map((t, i) => <li key={i}>! {t}</li>)}
                         </ul>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeSubTab === 'Roadmap' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {(results.phasedRoadmap || []).map((phase, i) => (
                 <div key={i} className="glass-card rounded-[3rem] p-10 flex flex-col h-full border-white/5 relative group">
                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center font-black text-white text-xl shadow-2xl">0{i+1}</div>
                    <div className="space-y-2 mb-8">
                       <h3 className="text-2xl font-black text-white brand-font uppercase tracking-tighter">{phase.phaseName}</h3>
                       <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">{phase.objective}</p>
                    </div>
                    <div className="space-y-6 flex-1">
                       <div className="space-y-3">
                          <span className="text-[8px] font-black text-slate-600 uppercase">Critical Actions</span>
                          <div className="space-y-2">
                             {(phase.actions || []).map((action, j) => (
                               <div key={j} className="flex gap-3 items-center p-3 bg-white/5 border border-white/5 rounded-xl transition-all">
                                  <span className="text-emerald-500 text-xs">✔</span>
                                  <p className="text-[11px] text-slate-400 font-medium">{action}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeSubTab === 'Audit' && (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-700">
             <div className="glass-card rounded-[4rem] p-16 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent space-y-12 relative overflow-hidden">
                <div className="text-center space-y-6 relative">
                   <div className="inline-block px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">Guardian Protocol Verified</div>
                   <h2 className="text-6xl font-black text-white brand-font uppercase tracking-tighter">Release Certificate</h2>
                   <div className="flex justify-center gap-12 pt-4">
                      <div className="text-center">
                         <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Audit Score</div>
                         <div className="text-6xl font-black text-emerald-400">{results.auditCertificate?.score || 0}</div>
                      </div>
                      <div className="text-center">
                         <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Market Readiness</div>
                         <div className="text-5xl font-black text-white tracking-widest">{results.auditCertificate?.readinessStatus || 'BETA'}</div>
                      </div>
                   </div>
                </div>

                <div className="p-10 bg-black/40 border border-white/10 rounded-[3rem] space-y-4 text-center">
                   <p className="text-lg text-slate-300 leading-relaxed italic">"{results.auditCertificate?.guardianNotes || 'Awaiting final QC review.'}"</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-8">
                   <button onClick={() => window.print()} className="flex-1 py-5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:brightness-90 transition-all">Print Outcome Dossier</button>
                   <button className="flex-1 py-5 aura-gradient text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-600/30">Secure Vault Storage</button>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-8 border-t border-white/5">
        <button onClick={onMonitorPerformance} className="flex-1 aura-gradient p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-2xl shadow-purple-600/20 hover:scale-[1.01] active:scale-95 transition-all">Activate Swarm Delivery</button>
        <div className="flex gap-2">
          <button onClick={handleExportManifest} className="px-10 py-5 bg-slate-900 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] text-slate-300 hover:bg-white/5 transition-all">Export Manifest</button>
          <button onClick={handleExportJSON} className="px-10 py-5 bg-slate-900 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] text-emerald-400 hover:bg-white/5 transition-all">Export JSON</button>
        </div>
      </div>
    </div>
  );
};

export default OutcomeView;
