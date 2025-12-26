# Modular AI Integration Guide (GitHub Models)

This document outlines the modular integration of GitHub Models as implemented in **Xandalyze AI**. This architecture is designed for high portability, security, and flexibility across any Next.js application.

## 1. Core Architecture Overview

The integration follows a three-tier modular pattern:
1.  **Backend (API Route)**: Securely handles API keys and communicates with GitHub Models Inference API.
2.  **Service Layer (Custom Hook)**: Abstracts the fetch logic and handles client-side settings.
3.  **UI Layer (Intent-based Sidebar)**: Uses the service layer to perform specific tasks via prompt engineering in a resizable sidebar.

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
    const modelName = process.env.GITHUB_MODEL_NAME || "gpt-4o-mini"; // Default model

    if (!githubToken) {
      return NextResponse.json({ error: "GitHub Token not configured" }, { status: 500 });
    }

    // 2. Prepare Messages
    const messages = [
      { role: "system", content: "You are Xandalyze AI, a specialized assistant for the Xandeum network. You analyze pNode gossip data and provide technical insights." },
    ];
    // ... history processing ...
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
    // ... response handling ...
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
    // ... error handling ...
    return await response.json();
  };

  return { generate };
};
```

---

## 4. UI Layer: Intent-based Implementation
**File:** `components/ai/AICommandSidebar.tsx`

This component demonstrates how to use "System Prompting" to force the AI to return structured JSON for application logic, while also providing **Dynamic Offline Insights**.

### Step A: Dynamic Insights (Offline)
The sidebar calculates instant insights from the `nodes` array without making API calls, providing immediate value.

```typescript
const insights = useMemo(() => {
  const offlineNodes = nodes.filter(n => n.status !== 'Active');
  const avgLat = nodes.reduce((acc, n) => acc + n.latency, 0) / nodes.length;
  
  return [
    { title: 'Network Alert', desc: `${offlineNodes.length} nodes offline`, icon: <AlertCircle /> },
    { title: 'Performance', desc: `Avg latency: ${Math.round(avgLat)}ms`, icon: <Zap /> }
  ];
}, [nodes]);
```

### Step B: AI Intent Extraction
```typescript
const systemPrompt = `
  You are an intelligent assistant for Xandalyze.
  Analyze the user's request and extract the intent.
  
  Return ONLY a valid JSON object with this structure:
  {
    "intent": "analyze_network" | "optimize_nodes" | "unknown",
    "summary": "A short summary of what will be performed",
    "data": { ... }
  }
`;
```

---

## 5. Replication Checklist for New Apps

1.  **Environment Variables**: Set `GITHUB_TOKEN` and `GITHUB_MODEL_NAME`.
2.  **API Route**: Implement the secure proxy in `app/api/ai/generate/route.ts`.
3.  **Hook**: Use `useAI` to abstract the backend communication.
4.  **Prompt Engineering**: Use structured system prompts for JSON outputs.
5.  **Hybrid Intelligence**: Combine offline data processing (Dynamic Insights) with online LLM analysis (Xandalyze AI) for the best UX.
