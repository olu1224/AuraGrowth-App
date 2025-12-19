
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CampaignResults, Agent } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateMarketingOutcome(
    objective: string, 
    audience: string, 
    agents: Agent[]
  ): Promise<CampaignResults> {
    const researcher = agents.find(a => a.role === 'RESEARCHER');
    const strategist = agents.find(a => a.role === 'STRATEGIST');
    const copywriter = agents.find(a => a.role === 'COPYWRITER');
    const designer = agents.find(a => a.role === 'DESIGNER');

    const prompt = `
      Act as a high-end digital marketing agency outcome engine driven by a specialized swarm of AI agents.
      
      Objective: ${objective}
      Target Audience: ${audience}

      Agent Swarm Configuration:
      - Researcher (${researcher?.name}): Focus on ${researcher?.specialty}. Guidance: ${researcher?.instruction}
      - Strategist (${strategist?.name}): Focus on ${strategist?.specialty}. Guidance: ${strategist?.instruction}
      - Copywriter (${copywriter?.name}): Focus on ${copywriter?.specialty}. Guidance: ${copywriter?.instruction}
      - Designer (${designer?.name}): Focus on ${designer?.specialty}. Guidance: ${designer?.instruction}
      
      Deliver a JSON object including:
      1. strategy: A concise 3-step high-level marketing strategy based on the Strategist's focus.
      2. copy: Headline, body text, primary CTA, and 3 social media snippets based on the Copywriter's focus.
      3. visualPrompt: A detailed image generation prompt for the Designer based on their focus.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
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
                socialPosts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["headline", "body", "cta", "socialPosts"]
            },
            visualPrompt: { type: Type.STRING }
          },
          required: ["strategy", "copy", "visualPrompt"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as CampaignResults;
  }

  async generateCampaignImage(visualPrompt: string): Promise<string | undefined> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Create a professional marketing hero image for: ${visualPrompt}. High quality, cinematic lighting, 16:9 aspect ratio.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  }
}

export const geminiService = new GeminiService();
