import { GoogleGenAI, Type } from "@google/genai";
import { PNode, GeminiReport } from "../types";

// Note: In a real production build, this key should be proxied or strictly env-gated.
// For the purpose of this demo, we assume the environment variable is available.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateNetworkReport = async (nodes: PNode[]): Promise<GeminiReport> => {
  if (!API_KEY) {
    throw new Error("Missing API Key");
  }

  // Prepare data summary to save tokens
  const activeCount = nodes.filter(n => n.status === 'Active').length;
  const avgLatency = nodes.reduce((acc, curr) => acc + curr.latency, 0) / (nodes.length || 1);
  const versions = [...new Set(nodes.map(n => n.version).filter(Boolean))];
  
  const promptData = JSON.stringify({
    totalNodes: nodes.length,
    activeNodes: activeCount,
    averageLatency: avgLatency.toFixed(2),
    versionsInUse: versions,
    sampleNodeStatuses: nodes.slice(0, 10).map(n => ({ id: n.identityPubkey, status: n.status }))
  });

  const modelId = "gemini-2.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Analyze these Xandeum pNode network statistics and provide a technical health report. 
      Data: ${promptData}. 
      Return JSON with fields: summary (string), healthScore (number 0-100), and recommendations (string array).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            healthScore: { type: Type.NUMBER },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    return JSON.parse(jsonText) as GeminiReport;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
