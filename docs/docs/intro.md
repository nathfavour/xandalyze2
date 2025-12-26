---
sidebar_position: 1
slug: /
---

# 🛡️ Xandalyze: Next-Gen Xandeum pNode Analytics

**Xandalyze** is a high-performance analytics dashboard built for the Xandeum ecosystem. It provides real-time visibility into the pNode (storage provider) gossip network, offering deep technical metrics, global health visualizations, and an integrated AI architect to help operators optimize their infrastructure.

Built for the **Superteam Xandeum Bounty**, Xandalyze focuses on **Clarity**, **Innovation**, and **Real-time Accuracy**.

---

## ✨ Key Features

### 📊 Real-Time pNode Monitoring
- **Live Gossip Integration**: Directly connects to Xandeum pRPC (\`getClusterNodes\`) to track active storage providers.
- **Advanced Registry**: Searchable and sortable table featuring Pubkeys, Versions, Latency, and Uptime.
- **Health Indicators**: Color-coded status vectors (Active, Delinquent, Offline) for instant network assessment.

### 🤖 Xandalyze AI (Powered by GitHub Models)
- **AI Architect**: Generates comprehensive network health reports using \`gpt-4o-mini\`.
- **Dynamic Insights**: A real-time, offline-capable insight engine that identifies latency spikes and storage bottlenecks instantly.
- **Natural Language Commands**: Ask the AI to "Analyze the highest latency nodes" or "Summarize storage capacity" for instant data synthesis.

### 🎨 Professional-Grade UI/UX
- **Resizable Multi-Sidebar Layout**: A flexible workspace with a collapsible navigation menu and an adjustable AI command center.
- **Xandeum Brand Identity**: Fully themed with official Xandeum colors and assets for a native ecosystem feel.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Backend**: GitHub Models Inference API (\`gpt-4o-mini\`)
- **Data Source**: Xandeum pRPC (Devnet)
