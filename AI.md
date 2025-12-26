# Modular AI Integration Guide (GitHub Models)

This document outlines the modular integration of GitHub Models as implemented in **Xandalyze**. This architecture is designed for high portability, security, and flexibility across any Next.js application.

## 1. Core Architecture Overview

The integration follows a three-tier modular pattern:
1.  **Backend (API Route)**: Securely handles API keys and communicates with GitHub Models Inference API.
2.  **Service Layer (Custom Hook)**: Abstracts the fetch logic and handles client-side settings (like user-provided GitHub tokens).
3.  **UI Layer (Intent-based Components)**: Uses the service layer to perform specific tasks via prompt engineering.

---

## 2. Backend: The API Route
**File:** `app/api/ai/generate/route.ts`

The backend is responsible for model initialization and handling both system-wide and user-specific GitHub tokens.

```typescript
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
```

---

## 3. Service Layer: The `useAI` Hook
**File:** `hooks/useAI.ts`

This hook provides a clean interface for components, automatically handling headers and settings.

```typescript
'use client';

import { useSettings } from './useSettings';

export const useAI = () => {
  const { userSettings } = useSettings();

  const generate = async (prompt: string, contextHistory: any[] = []) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    
    // Inject user-specific token if available in settings
    if (userSettings?.customGithubToken) {
      headers["x-user-github-token"] = userSettings.customGithubToken;
    }

    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt, history: contextHistory }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "AI Generation failed");
    }
    return await response.json();
  };

  return { generate };
};
```

---

## 4. UI Layer: Intent-based Implementation
**File:** `components/ai/AICommandModal.tsx`

This component demonstrates how to use "System Prompting" to force the AI to return structured JSON for application logic.

### Step A: Define the System Prompt
```typescript
const systemPrompt = `
  You are an intelligent assistant for Xandalyze.
  Analyze the user's request and extract the intent to analyze a node or the network.
  
  Return ONLY a valid JSON object with this structure:
  {
    "intent": "analyze_node" | "analyze_network" | "unknown",
    "summary": "A short summary of what will be analyzed",
    "data": { ... }
  }
`;
```

### Step B: Execute and Parse
```typescript
const handleAnalyze = async () => {
  setIsLoading(true);
  try {
    const response = await generate(`${systemPrompt}\n\nUser Request: ${prompt}`);
    
    // Clean Markdown formatting if AI includes it
    const jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    setResult(parsed);
  } catch (error) {
    console.error('AI Analysis failed', error);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 5. Replication Checklist for New Apps

1.  **Environment Variables**:
    - `GITHUB_TOKEN`: Your system-wide GitHub Personal Access Token.
    - `GITHUB_MODEL_NAME`: (Optional) e.g., `gpt-4o-mini`.
2.  **API Route**: Copy the route logic to `app/api/ai/generate/route.ts`.
3.  **Hook**: Implement `useAI` to wrap the fetch call.
4.  **Prompt Engineering**: Always include "Return ONLY a valid JSON object" in system prompts when the output needs to be processed by code.
5.  **Error Handling**: Always wrap `JSON.parse` in a try-catch as AI outputs can occasionally be malformed.
