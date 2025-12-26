# Modular AI Integration Guide (Gemini)

This document outlines the textbook modular integration of Google Gemini AI as implemented in **WhisperrFlow**. This architecture is designed for high portability, security, and flexibility across any Next.js application.

## 1. Core Architecture Overview

The integration follows a three-tier modular pattern:
1.  **Backend (API Route)**: Securely handles API keys and communicates with Google Generative AI.
2.  **Service Layer (Custom Hook)**: Abstracts the fetch logic and handles client-side settings (like user-provided API keys).
3.  **UI Layer (Intent-based Components)**: Uses the service layer to perform specific tasks via prompt engineering.

---

## 2. Backend: The API Route
**File:** `app/api/ai/generate/route.ts`

The backend is responsible for model initialization and handling both system-wide and user-specific API keys.

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, history } = await req.json();
    
    // 1. Key Source Determination (Modular Security)
    // Allows users to use their own keys or fall back to the system key
    const userKey = req.headers.get("x-user-gemini-key");
    const apiKey = userKey || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "No API Key configured" }, { status: 500 });
    }

    // 2. Initialize Model
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL_NAME || "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    // 3. Handle Chat vs Single Prompt
    if (history && history.length > 0) {
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(prompt);
      return NextResponse.json({ text: result.response.text() });
    } else {
      const result = await model.generateContent(prompt);
      return NextResponse.json({ text: result.response.text() });
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
    
    // Inject user-specific key if available in settings
    if (userSettings?.customGeminiKey) {
      headers["x-user-gemini-key"] = userSettings.customGeminiKey;
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
  You are an intelligent assistant for a productivity app.
  Analyze the user's request and extract the intent to create a "task" or an "event".
  
  Current Date: ${new Date().toISOString()}
  
  Return ONLY a valid JSON object with this structure:
  {
    "intent": "create_task" | "create_event" | "unknown",
    "summary": "A short summary of what will be created",
    "data": {
      "title": "string",
      "description": "string (optional)",
      "priority": "low" | "medium" | "high" | "urgent",
      "dueDate": "ISO date string (optional)"
    }
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

1.  **Install Dependency**: `npm install @google/generative-ai`
2.  **Environment Variables**:
    - `GOOGLE_API_KEY`: Your system-wide Gemini key.
    - `GEMINI_MODEL_NAME`: (Optional) e.g., `gemini-2.0-flash`.
3.  **API Route**: Copy the route logic to `app/api/ai/generate/route.ts`.
4.  **Hook**: Implement `useAI` to wrap the fetch call.
5.  **Prompt Engineering**: Always include "Return ONLY a valid JSON object" in system prompts when the output needs to be processed by code.
6.  **Error Handling**: Always wrap `JSON.parse` in a try-catch as AI outputs can occasionally be malformed.
