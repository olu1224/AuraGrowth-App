
import { GoogleGenAI, Type, VideoGenerationReferenceType } from "@google/genai";
import { CampaignResults, Agent, ClientProposal } from "../types";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are the AuraGrowth Swarm Controller. Create a comprehensive marketing outcome. Include separate copy for Social and Email. Include a video prompt and a distribution plan. IMPORTANT: Video prompts MUST be strictly VISUAL, DESCRIBING MOTION, LIGHTING, AND TEXTURES. EXPLICITLY specify 'NO TEXT, NO LETTERS, NO WRITING, NO CAPTIONS' to avoid AI spelling artifacts. Return strictly JSON.",
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
    });

    return JSON.parse(response.text || '{}') as CampaignResults;
  }

  async generateCampaignImage(visualPrompt: string, referenceAsset?: string): Promise<string | undefined> {
    const ai = this.getAI();
    const contents: any[] = [];
    
    // Commands for the model to use the reference
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

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: contents },
      config: {
        imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  }

  async generateCampaignVideo(videoPrompt: string, aspectRatio: '16:9' | '9:16' = '16:9', referenceAsset?: string): Promise<{ url: string, rawVideo: any } | undefined> {
    const ai = this.getAI();
    try {
      // NOTE: For reference images, model must be 'veo-3.1-generate-preview' and aspectRatio '16:9'.
      const finalAspectRatio = referenceAsset ? '16:9' : aspectRatio;
      const config: any = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: finalAspectRatio
      };

      const promptText = `Hyper-visual cinematic sequence, focusing on motion, light, and texture. ${videoPrompt}. ${referenceAsset ? "Incorporate the provided reference image/logo as a natural physical element within this environment." : ""} ABSOLUTELY NO ON-SCREEN TEXT, NO LETTERS, NO LOGOS, NO WRITING, NO CAPTIONS.`;

      let operation;
      if (referenceAsset) {
        const base64Data = referenceAsset.split(',')[1] || referenceAsset;
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-generate-preview',
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
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: promptText,
          config: config
        });
      }

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const video = operation.response?.generatedVideos?.[0]?.video;
      if (video?.uri) {
        return {
          url: `${video.uri}&key=${process.env.API_KEY}`,
          rawVideo: video
        };
      }
    } catch (error) {
      console.error("Video Generation Error:", error);
    }
    return undefined;
  }

  async extendCampaignVideo(videoPrompt: string, previousVideo: any, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<{ url: string, rawVideo: any } | undefined> {
    const ai = this.getAI();
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: `Continue the cinematic narrative seamlessly: ${videoPrompt}. ABSOLUTELY NO ON-SCREEN TEXT, LETTERS, OR LOGOS. Focus on continuous motion and environmental details.`,
        video: previousVideo,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const video = operation.response?.generatedVideos?.[0]?.video;
      if (video?.uri) {
        return {
          url: `${video.uri}&key=${process.env.API_KEY}`,
          rawVideo: video
        };
      }
    } catch (error) {
      console.error("Video Extension Error:", error);
    }
    return undefined;
  }

  async generateClientProposal(marketName: string): Promise<ClientProposal> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
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
    });
    return JSON.parse(response.text || '{}') as ClientProposal;
  }
}

export const geminiService = new GeminiService();
