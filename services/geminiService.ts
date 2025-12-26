import { PNode, GeminiReport } from "../types";

export const generateNetworkReport = async (nodes: PNode[]): Promise<GeminiReport> => {
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

  const systemPrompt = `Analyze these Xandeum pNode network statistics and provide a technical health report. 
      Return ONLY a valid JSON object with fields: summary (string), healthScore (number 0-100), and recommendations (string array).`;

  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: `${systemPrompt}\n\nData: ${promptData}` 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "AI Generation failed");
    }

    const data = await response.json();
    const jsonText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonText) as GeminiReport;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
