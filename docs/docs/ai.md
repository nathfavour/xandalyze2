---
sidebar_position: 3
---

# 🤖 AI Architecture

This document outlines the modular integration of GitHub Models as implemented in **Xandalyze AI**. This architecture is designed for high portability, security, and flexibility across any Next.js application.

## 1. Core Architecture Overview

The integration follows a three-tier modular pattern:
1.  **Backend (API Route)**: Securely handles API keys and communicates with GitHub Models Inference API.
2.  **Service Layer (Custom Hook)**: Abstracts the fetch logic and handles client-side settings.
3.  **UI Layer (Intent-based Sidebar)**: Uses the service layer to perform specific tasks via prompt engineering in a resizable sidebar.

---

## 2. Backend: The API Route
**File:** \`app/api/ai/generate/route.ts\`

The backend is responsible for model initialization and handling both system-wide and user-specific GitHub tokens.

---

## 3. Service Layer: The \`useAI\` Hook
**File:** \`hooks/useAI.ts\`

This hook provides a clean interface for components, automatically handling headers and settings.

---

## 4. UI Layer: Intent-based Implementation
**File:** \`components/ai/AICommandSidebar.tsx\`

This component demonstrates how to use "System Prompting" to force the AI to return structured JSON for application logic, while also providing **Dynamic Offline Insights**.

### Step A: Dynamic Insights (Offline)
The sidebar calculates instant insights from the \`nodes\` array without making API calls, providing immediate value.

### Step B: AI Intent Extraction
The AI is prompted to return structured JSON, allowing the UI to react to specific intents like "analyze_network" or "optimize_nodes".

---

## 5. Replication Checklist for New Apps

1.  **Environment Variables**: Set \`GITHUB_TOKEN\` and \`GITHUB_MODEL_NAME\`.
2.  **API Route**: Implement the secure proxy in \`app/api/ai/generate/route.ts\`.
3.  **Hook**: Use \`useAI\` to abstract the backend communication.
4.  **Prompt Engineering**: Use structured system prompts for JSON outputs.
5.  **Hybrid Intelligence**: Combine offline data processing (Dynamic Insights) with online LLM analysis (Xandalyze AI) for the best UX.
