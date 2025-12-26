import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, history } = await req.json();
    
    // 1. Authentication & Model Selection
    const userToken = req.headers.get("x-user-github-token");
    const githubToken = userToken || process.env.GITHUB_TOKEN;
    const modelName = process.env.GITHUB_MODEL_NAME || "gpt-4o-mini";

    if (!githubToken) {
      return NextResponse.json({ error: "GitHub Token not configured" }, { status: 500 });
    }

    // 2. Prepare Messages
    const messages = [
      { role: "system", content: "You are Xandalyze AI, a specialized assistant for the Xandeum network. You analyze pNode gossip data and provide technical insights." },
    ];

    if (history && history.length > 0) {
      // Convert history to GitHub Models format if necessary
      // Assuming history is an array of { role, parts: [{ text }] } from Gemini format
      // We'll map it to { role, content }
      history.forEach((h: any) => {
        messages.push({
          role: h.role === 'model' ? 'assistant' : h.role,
          content: typeof h.parts === 'string' ? h.parts : h.parts?.[0]?.text || ""
        });
      });
    }

    messages.push({ role: "user", content: prompt });

    // 3. Call GitHub Models Inference API
    const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${githubToken}`
      },
      body: JSON.stringify({
        messages,
        model: modelName,
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `GitHub API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      return NextResponse.json({ text: data.choices[0].message.content });
    } else {
      throw new Error("Unexpected response format from GitHub Models");
    }

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
