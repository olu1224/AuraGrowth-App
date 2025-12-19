
import { GoogleGenAI, Type, VideoGenerationReferenceType, GenerateContentResponse } from "@google/genai";
import { CampaignResults, Agent, ClientProposal } from "../types";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Helper to wrap API calls with a simple exponential backoff for 429s
   */
  private async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isQuotaError = error.message?.includes("429") || error.status === 429 || error.message?.toLowerCase().includes("quota");
      if (isQuotaError && retries > 0) {
        console.warn(`Quota hit, retrying in ${delay}ms... (${retries} attempts left)`);
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
    const researcher = agents.find(a => a.role === 'RESEARCHER');
    const strategist = agents.find(a => a.role === 'STRATEGIST');
    const copywriter = agents.find(a => a.role === 'COPYWRITER');
    const designer = agents.find(a => a.role === 'DESIGNER');
    const quality = agents.find(a => a.role === 'QUALITY_MANAGER');

    const model = isFast ? 'gemini-flash-lite-latest' : 'gemini-3-pro-preview';

    const prompt = `
      Act as the AuraGrowth Swarm Controller. Synthesize a massive outcome for:
      Objective: ${objective}
      Target Audience: ${audience}

      Agent Insights to use:
      - Researcher (${researcher?.name}): Focus on market data and pain points.
      - Strategist (${strategist?.name}): Focus on conversion funnels.
      - Copywriter (${copywriter?.name}): Focus on multi-channel messaging.
      - Designer (${designer?.name}): Focus on cinematic image and video vision.
      - Quality Manager (${quality?.name}): Ensure final results meet rigorous standards for brand excellence and conversion logic.
    `;

    // Fix: Explicitly cast to GenerateContentResponse to access the 'text' property
    const response = await this.withRetry(() => ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are the AuraGrowth Swarm Controller under the strict oversight of the Quality Manager. Create a comprehensive marketing outcome. Include separate copy for Social and Email. Include a video prompt and a distribution plan. IMPORTANT: Video prompts MUST be strictly VISUAL, DESCRIBING MOTION, LIGHTING, AND TEXTURES. EXPLICITLY specify 'NO TEXT, NO LETTERS, NO WRITING, NO CAPTIONS' to avoid AI spelling artifacts. Return strictly JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING },
            copy: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                body: { type: Type.STRING },
                cta: { type: Type.STRING },
                socialPosts: { type: Type.ARRAY, items: { type: Type.STRING } },
                emailSubject: { type: Type.STRING },
                emailBody: { type: Type.STRING }
              },
              required: ["headline", "body", "cta", "socialPosts", "emailSubject", "emailBody"]
            },
            distribution: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  channel: { type: Type.STRING },
                  action: { type: Type.STRING }
                }
              }
            },
            visualPrompt: { type: Type.STRING },
            videoPrompt: { type: Type.STRING }
          },
          required: ["strategy", "copy", "visualPrompt", "videoPrompt", "distribution"]
        }
      }
    })) as GenerateContentResponse;

    return JSON.parse(response.text || '{}') as CampaignResults;
  }

  async generateCampaignImage(visualPrompt: string, referenceAsset?: string): Promise<string | undefined> {
    const ai = this.getAI();
    const contents: any[] = [];
    
    const instruction = referenceAsset 
      ? `High-fidelity commercial marketing hero image. Incorporate the provided reference asset/logo into the scene: ${visualPrompt}. 16:9 aspect ratio, cinematic realism. ABSOLUTELY NO TEXT, NO OTHER LOGOS, NO WRITING.`
      : `High-fidelity commercial marketing hero image: ${visualPrompt}. 16:9 aspect ratio, cinematic realism. ABSOLUTELY NO TEXT, NO LOGOS, NO WRITING.`;

    if (referenceAsset) {
      const base64Data = referenceAsset.split(',')[1] || referenceAsset;
      contents.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/png'
        }
      });
    }
    
    contents.push({ text: instruction });

    // Fix: Explicitly cast response to GenerateContentResponse to access 'candidates'
    const response = await this.withRetry(() => ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: contents },
      config: {
        imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
      }
    })) as GenerateContentResponse;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  }

  async generateCampaignVideo(videoPrompt: string, aspectRatio: '16:9' | '9:16' = '16:9', referenceAsset?: string, willExtend: boolean = false): Promise<{ url: string, rawVideo: any } | undefined> {
    try {
      const model = (referenceAsset || willExtend) ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
      
      const finalAspectRatio = referenceAsset ? '16:9' : aspectRatio;
      const config: any = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: finalAspectRatio
      };

      const promptText = `Hyper-visual cinematic sequence. ${videoPrompt}. ${referenceAsset ? "Integrate the brand asset provided as a physical element in the scene." : ""} NO TEXT, NO CAPTIONS.`;

      // Fix: Cast operation to any to access 'done' and 'response' properties which might be typed as unknown by the generic helper
      let operation = await this.withRetry(() => {
        // GUIDELINE: Create a new GoogleGenAI instance right before making an API call for Veo models
        const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        if (referenceAsset) {
          const base64Data = referenceAsset.split(',')[1] || referenceAsset;
          return localAi.models.generateVideos({
            model: model,
            prompt: promptText,
            config: {
              ...config,
              referenceImages: [{
                image: {
                  imageBytes: base64Data,
                  mimeType: 'image/png',
                },
                referenceType: VideoGenerationReferenceType.ASSET,
              }]
            }
          });
        } else {
          return localAi.models.generateVideos({
            model: model,
            prompt: promptText,
            config: config
          });
        }
      }) as any;

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        try {
          operation = await this.withRetry(() => {
             const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
             return localAi.operations.getVideosOperation({ operation: operation });
          }) as any;
        } catch (pollErr: any) {
          if (pollErr.message?.includes("Requested entity was not found")) {
            await window.aistudio?.openSelectKey?.();
          }
          throw pollErr;
        }
      }

      const video = operation.response?.generatedVideos?.[0]?.video;
      if (video?.uri) {
        return {
          url: `${video.uri}&key=${process.env.API_KEY}`,
          rawVideo: video
        };
      }
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        await window.aistudio?.openSelectKey?.();
      }
      throw error;
    }
    return undefined;
  }

  async extendCampaignVideo(videoPrompt: string, previousVideo: any, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<{ url: string, rawVideo: any } | undefined> {
    try {
      // Fix: Cast operation to any to access 'done' and 'response' properties
      let operation = await this.withRetry(() => {
        // GUIDELINE: Create a new GoogleGenAI instance right before making an API call for Veo models
        const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return localAi.models.generateVideos({
          model: 'veo-3.1-generate-preview',
          prompt: `Seamlessly continue the movement and visual narrative from the previous shot. The camera and action should transition perfectly: ${videoPrompt}. NO TEXT, NO CAPTIONS.`,
          video: previousVideo,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
          }
        });
      }) as any;

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        try {
          operation = await this.withRetry(() => {
            const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
            return localAi.operations.getVideosOperation({ operation: operation });
          }) as any;
        } catch (pollErr: any) {
          if (pollErr.message?.includes("Requested entity was not found")) {
            await window.aistudio?.openSelectKey?.();
          }
          throw pollErr;
        }
      }

      const video = operation.response?.generatedVideos?.[0]?.video;
      if (video?.uri) {
        return {
          url: `${video.uri}&key=${process.env.API_KEY}`,
          rawVideo: video
        };
      }
    } catch (error: any) {
      console.error("Video Extension Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        await window.aistudio?.openSelectKey?.();
      }
      throw error;
    }
    return undefined;
  }

  async generateClientProposal(marketName: string): Promise<ClientProposal> {
    const ai = this.getAI();
    // Fix: Explicitly cast response to GenerateContentResponse to access 'text' property
    const response = await this.withRetry(() => ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Generate a proposal for ${marketName}.`,
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
    })) as GenerateContentResponse;
    return JSON.parse(response.text || '{}') as ClientProposal;
  }
}

export const geminiService = new GeminiService();
