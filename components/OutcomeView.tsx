
import React, { useState, useRef } from 'react';
import { CampaignResults } from '../types';
import { geminiService } from '../services/geminiService';

interface OutcomeViewProps {
  results: CampaignResults;
  onMonitorPerformance?: () => void;
  isActivated?: boolean;
}

const OutcomeView: React.FC<OutcomeViewProps> = ({ results, onMonitorPerformance, isActivated }) => {
  const [activeSubTab, setActiveSubTab] = useState<'Assets' | 'Briefing' | 'Roadmap' | 'Guide'>('Assets');
  
  // Local state for assets to allow post-generation updates
  const [localCampaignAsset, setLocalCampaignAsset] = useState<string | undefined>(results.campaignAsset);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(results.videoUrl);
  const [visualUrl, setVisualUrl] = useState<string | undefined>(results.visualUrl);
  
  // Processing states
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [videoGenerationStatus, setVideoGenerationStatus] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  // Video settings
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [targetDuration, setTargetDuration] = useState<number>(8); // Default 8s

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerCopyFeedback = (msg: string) => {
    setCopyFeedback(msg);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalCampaignAsset(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    if (!visualUrl) return;
    const link = document.createElement('a');
    link.href = visualUrl;
    link.download = `AuraGrowth-Hero-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateImage = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const newUrl = await geminiService.generateCampaignImage(results.visualPrompt, localCampaignAsset);
      if (newUrl) setVisualUrl(newUrl);
    } catch (error) {
      console.error("Image Regeneration Error:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (isGeneratingVideo) return;
    
    setIsGeneratingVideo(true);
    setVideoUrl(undefined); 
    setVideoGenerationStatus('Initializing Swarm Brain...');
    
    try {
      // For reference assets, API requires 16:9
      const effectiveAspectRatio = localCampaignAsset ? '16:9' : videoAspectRatio;
      
      // 1. Initial Segment (0-8s)
      setVideoGenerationStatus('Synthesizing Master Segment (0-8s)...');
      // Use the local campaign asset (newly uploaded or from results)
      const initialResult = await geminiService.generateCampaignVideo(results.videoPrompt, effectiveAspectRatio, localCampaignAsset);
      
      if (!initialResult) throw new Error("Initial synthesis failed.");

      let currentRawVideo = initialResult.rawVideo;
      let currentUrl = initialResult.url;
      
      // Calculate extensions. Each extension adds exactly 7 seconds.
      const extensions = targetDuration === 15 ? 1 : targetDuration === 30 ? 3 : targetDuration === 60 ? 7 : 0;

      for (let i = 0; i < extensions; i++) {
        setVideoGenerationStatus(`Neural Extension: Step ${i + 1}/${extensions} (~${8 + (i+1)*7}s)...`);
        const extendedResult = await geminiService.extendCampaignVideo(results.videoPrompt, currentRawVideo, effectiveAspectRatio);
        
        if (!extendedResult) {
          console.warn("An extension step failed, using last stable URL.");
          break;
        }
        
        currentRawVideo = extendedResult.rawVideo;
        currentUrl = extendedResult.url;
      }

      setVideoGenerationStatus('Compiling final high-fidelity narrative...');
      
      const response = await fetch(currentUrl);
      if (!response.ok) throw new Error("Failed to secure final media stream");
      
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      
      setVideoUrl(localUrl);
      setVideoGenerationStatus(`Success: ${targetDuration}s Sequence Compiled.`);
      
    } catch (error) {
      console.error("Video Gen Error:", error);
      setVideoGenerationStatus('Synthesis failed. Check network or shorten duration.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `AuraGrowth-Motion-${targetDuration}s-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const exportData = {
      ...results,
      campaignAsset: localCampaignAsset,
      visualUrl: visualUrl,
      videoMetadata: {
        url: videoUrl,
        aspectRatio: localCampaignAsset ? '16:9' : videoAspectRatio,
        durationSeconds: targetDuration,
        prompt: results.videoPrompt,
        brandingIntegrated: !!localCampaignAsset
      },
      deliveryMeta: {
        generatedAt: new Date().toISOString(),
        isActivated: !!isActivated
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
  };

  const handleExportPackage = () => {
    const timestamp = new Date().toLocaleString();
    const divider = "\n" + "=".repeat(60) + "\n";
    
    let content = `AURAGROWTH ASB - MASTER DELIVERY PACKAGE\nGenerated: ${timestamp}\n`;
    content += `Status: ${isActivated ? 'LIVE IN MARKET' : 'DRAFT OUTCOME'}\n`;
    content += divider;
    content += `1. STRATEGIC BLUEPRINT:\n${results.strategy}\n`;
    content += divider;
    content += `2. MULTI-CHANNEL COPY ASSETS:\n`;
    content += `Headline: ${results.copy.headline}\n`;
    content += `Body: ${results.copy.body}\n`;
    content += `CTA: ${results.copy.cta}\n\n`;
    
    content += `SOCIAL THREADS / POSTS:\n`;
    results.copy.socialPosts.forEach((post, i) => {
      content += `[POST ${i + 1}] ${post}\n`;
    });
    
    content += divider;
    content += `3. DIRECT NARRATIVE (EMAIL):\n`;
    content += `Subject: ${results.copy.emailSubject}\n`;
    content += `Body: ${results.copy.emailBody}\n`;
    
    content += divider;
    content += `4. DEPLOYMENT ROADMAP & PHASING:\n`;
    results.distribution.forEach((step, i) => {
      content += `PHASE 0${i + 1} | CHANNEL: ${step.channel.padEnd(10)} | ACTION: ${step.action}\n`;
    });
    
    content += divider;
    content += `5. NEURAL MEDIA MANIFEST:\n`;
    content += `Visual Hero Prompt: ${results.visualPrompt}\n`;
    content += `Motion Dynamics Prompt: ${results.videoPrompt}\n`;
    if (localCampaignAsset) {
      content += `Attached Brand Asset: Integrated via Neural Asset Reference\n`;
    }
    if (videoUrl) {
      content += `Video Duration: ${targetDuration} seconds\n`;
      content += `Video Aspect Ratio: ${localCampaignAsset ? '16:9' : videoAspectRatio}\n`;
      content += `Internal Media URL: ${videoUrl}\n`;
    } else {
      content += `Video Status: Pending Synthesis\n`;
    }
    
    content += divider;
    content += `DELIVERY GUIDE & UTILIZATION:\n`;
    content += `- TXT GUIDE: Operational blueprint for execution teams.\n`;
    content += `- JSON BLUEPRINT: Programmatic core for automated system ingestion.\n`;
    content += `- MULTIMEDIA: Use 'Download' buttons in Dashboard for PNG/MP4 source files.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AuraGrowth-Guide-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'Assets' as const, label: 'Outcome Assets' },
    { id: 'Briefing' as const, label: 'Intelligence Briefing' },
    { id: 'Roadmap' as const, label: 'Deployment Roadmap' },
    { id: 'Guide' as const, label: 'Delivery Guide' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex gap-8 border-b border-white/5 pb-2">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setActiveSubTab(tab.id);
            }}
            className={`text-[10px] font-black uppercase tracking-[0.2em] pb-3 relative transition-all cursor-pointer z-10 ${
              activeSubTab === tab.id 
                ? 'text-purple-400 opacity-100' 
                : 'text-slate-500 opacity-60 hover:opacity-100 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {activeSubTab === tab.id && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)] z-20"></span>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[500px] w-full">
        {activeSubTab === 'Assets' && (
          <div className="grid grid-cols-12 gap-6 items-start animate-in fade-in slide-in-from-left-2 duration-500">
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="glass-card rounded-[2rem] p-8 border-purple-500/20 relative group">
                <div className="absolute top-4 right-6 text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded tracking-widest uppercase">Est. Agency Value: $8,500</div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 border-l-2 border-purple-500 pl-4">Campaign Strategy</h4>
                <p className="text-[13px] text-slate-200 leading-relaxed font-medium">
                  {results.strategy || "Strategizing next steps..."}
                </p>
              </div>

              <div className="glass-card rounded-[2rem] p-8 space-y-6 bg-slate-900/40 border-white/5 relative">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ad Copy & Hook</h4>
                  <div className="flex items-center gap-2">
                    {copyFeedback && <span className="text-[7px] font-black text-emerald-400 uppercase animate-pulse">{copyFeedback}</span>}
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${results.copy?.headline}\n\n${results.copy?.body}`);
                        triggerCopyFeedback('All Copied');
                      }} 
                      className="text-[8px] font-bold text-pink-500 uppercase hover:underline"
                    >
                      Copy All
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-bold text-slate-600 uppercase">Headline</span>
                    <p className="text-lg font-black text-white leading-tight mt-1">{results.copy?.headline || "Catchy Headline"}</p>
                  </div>
                  <div className="group/body">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-bold text-slate-600 uppercase">Body Text</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(results.copy?.body || "");
                          triggerCopyFeedback('Body Copied');
                        }}
                        className="text-[7px] font-black text-slate-500 uppercase hover:text-white transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{results.copy?.body || "Compelling body text content goes here..."}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="glass-card rounded-[2rem] overflow-hidden border-white/5 relative group h-[300px]">
                {visualUrl ? (
                  <img src={visualUrl} alt="Visual Outcome" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" />
                ) : (
                  <div className="w-full h-full bg-slate-800 animate-pulse flex items-center justify-center text-[10px] font-black uppercase text-slate-600 tracking-[0.3em]">Rendering Master Asset...</div>
                )}
                
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/20 to-transparent flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">AI Static Asset</span>
                    <div className="flex gap-2">
                      <button onClick={downloadImage} className="px-3 py-1.5 bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all">Download</button>
                      <button 
                        onClick={handleGenerateImage} 
                        disabled={isGeneratingImage}
                        className="px-3 py-1.5 bg-white/10 text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-white/20 transition-all border border-white/10"
                      >
                        {isGeneratingImage ? 'Synthesizing...' : 'Regenerate Hero'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-[2rem] overflow-hidden border-white/5 relative group min-h-[220px] bg-slate-900/60 flex flex-col">
                {videoUrl ? (
                  <div className="w-full h-full space-y-3 p-4">
                    <div className={`mx-auto rounded-xl overflow-hidden bg-black border border-white/5 relative ${localCampaignAsset || videoAspectRatio === '9:16' ? 'aspect-video w-full' : 'aspect-video w-full'} ${localCampaignAsset || videoAspectRatio === '9:16' && !localCampaignAsset ? 'h-[320px] w-[180px]' : ''}`}>
                       <video key={videoUrl} src={videoUrl} controls className="w-full h-full object-cover" playsInline />
                       <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[7px] font-bold text-emerald-400 uppercase">Veo 3 Neural Reference</div>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Neural Narrative ({targetDuration}s)</span>
                       <div className="flex gap-2">
                         <button onClick={() => setVideoUrl(undefined)} className="px-3 py-1.5 bg-white/5 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all">New Version</button>
                         <button onClick={downloadVideo} className="px-3 py-1.5 bg-pink-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all">Download MP4</button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-4">
                    {isGeneratingVideo ? (
                      <div className="space-y-4 w-full">
                        <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin mx-auto"></div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Growing Narrative...</p>
                           <p className="text-[8px] text-slate-500 italic uppercase">{videoGenerationStatus}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-6 w-full justify-center">
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/5 cursor-pointer hover:border-purple-500/50 transition-all relative overflow-hidden group/logo"
                          >
                            {localCampaignAsset ? (
                              <img src={localCampaignAsset} alt="Brand Asset" className="w-full h-full object-cover opacity-60 group-hover/logo:opacity-100 transition-opacity" />
                            ) : (
                              <span className="text-xl">📁</span>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 bg-black/40 transition-opacity">
                              <span className="text-[6px] font-black text-white uppercase tracking-widest">Update Logo</span>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </div>
                          
                          <div className="text-left space-y-1">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Brand Integration</h4>
                            <p className="text-[7px] text-slate-500 uppercase font-bold leading-tight max-w-[120px]">Upload a logo or reference image to embed it naturally in the video.</p>
                          </div>
                        </div>

                        <div className="space-y-4 w-full">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-center gap-1.5">
                              {[8, 15, 30, 60].map(d => (
                                <button key={d} onClick={() => setTargetDuration(d)} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${targetDuration === d ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white/5 text-slate-500 border border-white/10 hover:border-white/30'}`}>{d}s</button>
                              ))}
                            </div>
                            <div className="flex justify-center gap-2">
                              {localCampaignAsset ? (
                                <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[8px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                  Locked to 16:9 (Brand Reference)
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => setVideoAspectRatio('16:9')} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${videoAspectRatio === '16:9' ? 'bg-white text-black' : 'bg-white/5 text-slate-500 border border-white/10'}`}>16:9 Land</button>
                                  <button onClick={() => setVideoAspectRatio('9:16')} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${videoAspectRatio === '9:16' ? 'bg-white text-black' : 'bg-white/5 text-slate-500 border border-white/10'}`}>9:16 Port</button>
                                </>
                              )}
                            </div>
                          </div>
                          <button onClick={handleGenerateVideo} className="w-full py-3 bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-purple-600/20">Synthesize {targetDuration}s Sequence</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="glass-card rounded-[2rem] p-8 space-y-8 bg-black/40 border-white/5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Integration</h4>
                <div className="grid grid-cols-4 gap-2">
                  {['META', 'GOOGLE', 'X', 'TIKTOK'].map(p => (
                    <div key={p} className="p-2 border border-white/5 rounded-xl text-center bg-white/5 group hover:bg-emerald-500/10 transition-all cursor-default">
                      <div className="text-[8px] font-black text-slate-500 group-hover:text-emerald-500 mb-0.5">{p}</div>
                      <div className="text-[6px] font-black text-slate-700 group-hover:text-emerald-500 uppercase">Pending</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  {results.copy?.socialPosts?.slice(0, 3).map((post, i) => (
                    <div key={i} className="space-y-2 border-l-2 border-slate-800 pl-4 py-1">
                      <p className="text-[11px] text-slate-400 leading-relaxed italic">"{post}"</p>
                    </div>
                  )) || <p className="text-[10px] text-slate-600">Generating social threads...</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'Briefing' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="glass-card rounded-[2.5rem] p-10 space-y-6 border-emerald-500/20">
                  <h3 className="text-2xl font-black text-white brand-font uppercase tracking-tighter">Strategic Synthesis</h3>
                  <div className="prose prose-invert max-w-none"><p className="text-slate-300 leading-relaxed text-sm">{results.strategy}</p></div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="glass-card rounded-[2.5rem] p-8 space-y-6 border-purple-500/20">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Vision Key</h4>
                  <div className="bg-black/40 p-5 rounded-2xl border border-white/10 font-mono text-[10px] text-purple-300 leading-relaxed break-words">{results.visualPrompt}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'Roadmap' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="glass-card rounded-[3rem] p-12 border-emerald-500/20">
              <h3 className="text-3xl font-black text-white brand-font uppercase tracking-tighter mb-12">Execution Roadmap</h3>
              <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 md:before:mx-auto before:h-full before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:to-pink-500">
                {results.distribution?.map((step, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-slate-900 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-all group-hover:scale-110 group-hover:border-purple-500"><span className="text-[10px] font-black">{i + 1}</span></div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-6 rounded-3xl border border-white/5">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{step.channel}</span>
                      <p className="text-sm text-slate-200 font-bold">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'Guide' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="glass-card rounded-[2.5rem] p-12 border-purple-500/20 space-y-10">
              <h3 className="text-3xl font-black text-white brand-font uppercase tracking-tighter text-center">Deliverable Manifest</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-xl">📄</div><h4 className="text-lg font-bold text-white uppercase tracking-tighter">Guide (.txt)</h4></div>
                  <p className="text-xs text-slate-400 leading-relaxed">Full narrative script and strategic blueprint for human-led execution and manual campaign setup. Includes video metadata.</p>
                </div>
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-xl">⚙️</div><h4 className="text-lg font-bold text-white uppercase tracking-tighter">Blueprint (.json)</h4></div>
                  <p className="text-xs text-slate-400 leading-relaxed">Complete programmatic schema including neural metadata and video tracking for automated CRM ingestion.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <button onClick={onMonitorPerformance} className="flex-1 aura-gradient p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-2xl shadow-purple-600/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer">Activate Swarm</button>
        <div className="flex gap-2">
          <button onClick={handleExportPackage} className="px-8 py-5 bg-slate-900 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] text-slate-300 hover:bg-white/5 transition-all cursor-pointer">Guide</button>
          <button onClick={handleExportJSON} className="px-8 py-5 bg-slate-900 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] text-emerald-400 hover:bg-white/5 transition-all cursor-pointer">JSON</button>
        </div>
      </div>
    </div>
  );
};

export default OutcomeView;
