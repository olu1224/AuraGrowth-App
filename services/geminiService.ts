
import { GoogleGenAI, Type, VideoGenerationReferenceType, GenerateContentResponse } from "@google/genai";
import { CampaignResults, Agent, ClientProposal } from "../types";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isQuotaError = error.message?.includes("429") || error.status === 429;
      if (isQuotaError && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async generateMarketingOutcome(
    objective: string, 
    audience: string, 
    agents: Agent[],
    isFast: boolean = false
  ): Promise<CampaignResults> {
    const ai = this.getAI();
    const modelName = isFast ? 'gemini-flash-lite-latest' : 'gemini-3-pro-preview';

    const prompt = `
      Execute ASB Swarm Synthesis.
      Objective: ${objective}
      Target Audience: ${audience}
      Ensure deep strategic reasoning.
    `;

    const response = await this.withRetry(() => ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: "You are an elite ASB Controller. Output strictly professional strategic JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            marketIntelligence: {
              type: Type.OBJECT,
              properties: {
                swotAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                competitorVulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            audienceDossier: {
              type: Type.OBJECT,
              properties: {
                icps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      personaName: { type: Type.STRING },
                      painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      motivations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                },
                psychographics: { type: Type.STRING }
              }
            },
            coreOfferArchitecture: {
              type: Type.OBJECT,
              properties: {
                hook: { type: Type.STRING },
                transformation: { type: Type.STRING },
                guarantee: { type: Type.STRING }
              }
            },
            copy: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                body: { type: Type.STRING },
                cta: { type: Type.STRING },
                socialPosts: { type: Type.ARRAY, items: { type: Type.STRING } },
                emailSubject: { type: Type.STRING },
                emailBody: { type: Type.STRING },
                brandVoiceRules: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            phasedRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseName: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  kpis: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            visualPrompt: { type: Type.STRING },
            videoPrompt: { type: Type.STRING },
            auditCertificate: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                guardianNotes: { type: Type.STRING },
                readinessStatus: { type: Type.STRING }
              }
            }
          },
          required: ["executiveSummary", "marketIntelligence", "audienceDossier", "coreOfferArchitecture", "copy", "phasedRoadmap", "visualPrompt", "videoPrompt", "auditCertificate"]
        }
      }
    })) as GenerateContentResponse;

    const results = JSON.parse(response.text || '{}');
    return results as CampaignResults;
  }

  async generateCampaignImage(visualPrompt: string, referenceAsset?: string): Promise<string | undefined> {
    const ai = this.getAI();
    const contents: any[] = [];
    
    if (referenceAsset) {
      const base64Data = referenceAsset.split(',')[1] || referenceAsset;
      contents.push({ inlineData: { data: base64Data, mimeType: 'image/png' } });
    }
    contents.push({ text: `Elite visual: ${visualPrompt}. 16:9, NO TEXT.` });

    const response = await this.withRetry(() => ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: contents },
      config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    })) as GenerateContentResponse;

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return undefined;
  }

  async generateCampaignVideo(videoPrompt: string, aspectRatio: '16:9' | '9:16' = '16:9', referenceAsset?: string, willExtend: boolean = false): Promise<{ url: string, rawVideo: any } | undefined> {
    const model = (referenceAsset || willExtend) ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
    const config: any = { numberOfVideos: 1, resolution: '720p', aspectRatio: referenceAsset ? '16:9' : aspectRatio };
    
    let operation = await this.withRetry(() => {
      const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (referenceAsset) {
        const base64Data = referenceAsset.split(',')[1] || referenceAsset;
        return localAi.models.generateVideos({
          model: model,
          prompt: videoPrompt,
          config: {
            ...config,
            referenceImages: [{
              image: { imageBytes: base64Data, mimeType: 'image/png' },
              referenceType: VideoGenerationReferenceType.ASSET,
            }]
          }
        });
      }
      return localAi.models.generateVideos({ model, prompt: videoPrompt, config });
    }) as any;

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
      operation = await localAi.operations.getVideosOperation({ operation });
    }

    const video = operation.response?.generatedVideos?.[0]?.video;
    if (video?.uri) return { url: `${video.uri}&key=${process.env.API_KEY}`, rawVideo: video };
    return undefined;
  }

  async extendCampaignVideo(videoPrompt: string, previousVideo: any, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<{ url: string, rawVideo: any } | undefined> {
    const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await localAi.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: videoPrompt,
      video: previousVideo,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await localAi.operations.getVideosOperation({ operation });
    }

    const video = operation.response?.generatedVideos?.[0]?.video;
    if (video?.uri) return { url: `${video.uri}&key=${process.env.API_KEY}`, rawVideo: video };
    return undefined;
  }

  async generateClientProposal(marketName: string): Promise<ClientProposal> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Generate ASB proposal for ${marketName}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clientName: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            swarmBenefits: { type: Type.ARRAY, items: { type: Type.STRING } },
            pricingComparison: {
              type: Type.OBJECT,
              properties: {
                traditional: { type: Type.STRING },
                asb: { type: Type.STRING },
                savings: { type: Type.STRING }
              }
            },
            deliveryTimeline: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}') as ClientProposal;
  }
}

export const geminiService = new GeminiService();
