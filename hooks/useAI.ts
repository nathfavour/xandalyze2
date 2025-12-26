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
