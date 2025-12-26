# 🛡️ Xandalyze: Next-Gen Xandeum pNode Analytics

<div align="center">
  <img src="public/xandeum-logo.png" alt="Xandeum Logo" width="120" />
  <h3>The definitive real-time monitoring and AI-powered insight platform for the Xandeum Network.</h3>
</div>

---

## 🚀 Overview

**Xandalyze** is a high-performance analytics dashboard built for the Xandeum ecosystem. It provides real-time visibility into the pNode (storage provider) gossip network, offering deep technical metrics, global health visualizations, and an integrated AI architect to help operators optimize their infrastructure.

Built for the **Superteam Xandeum Bounty**, Xandalyze focuses on **Clarity**, **Innovation**, and **Real-time Accuracy**.

---

## ✨ Key Features

### 📊 Real-Time pNode Monitoring
- **Live Gossip Integration**: Directly connects to Xandeum pRPC (`getClusterNodes`) to track active storage providers.
- **Advanced Registry**: Searchable and sortable table featuring Pubkeys, Versions, Latency, and Uptime.
- **Health Indicators**: Color-coded status vectors (Active, Delinquent, Offline) for instant network assessment.

### 🤖 Xandalyze AI (Powered by GitHub Models)
- **AI Architect**: Generates comprehensive network health reports using `gpt-4o-mini`.
- **Dynamic Insights**: A real-time, offline-capable insight engine that identifies latency spikes and storage bottlenecks instantly.
- **Natural Language Commands**: Ask the AI to "Analyze the highest latency nodes" or "Summarize storage capacity" for instant data synthesis.

### 🎨 Professional-Grade UI/UX
- **Resizable Multi-Sidebar Layout**: A flexible workspace with a collapsible navigation menu and an adjustable AI command center.
- **Xandeum Brand Identity**: Fully themed with official Xandeum colors and assets for a native ecosystem feel.
- **Data Portability**: One-click JSON export for external analysis and reporting.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Backend**: GitHub Models Inference API (`gpt-4o-mini`)
- **Data Source**: Xandeum pRPC (Devnet)

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **pnpm** (Recommended)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nathfavour/xandalyze2.git
   cd xandalyze2
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file based on `env.sample`:
   ```env
   GITHUB_TOKEN=your_github_pat_here
   ```

4. **Run the development server**:
   ```bash
   pnpm dev
   ```

---

## 🎯 Bounty Compliance

This project was built to satisfy the **Xandeum Labs** bounty requirements:

- [x] **pRPC Integration**: Implemented in `services/pNodeService.ts` using `getClusterNodes`.
- [x] **pNode Information**: Displays all required gossip metadata (Pubkey, IP/Gossip, Version, Status).
- [x] **Innovation**: Added a modular AI layer and dynamic offline insights engine.
- [x] **Professional UI**: Modeled after industry leaders like `stakewiz.com` with a focus on data density and clarity.

---

## 📄 Documentation

- [AI Integration Guide](AI.md) - Deep dive into the modular AI architecture.
- [Usage Guide](usage.md) - Detailed instructions for network operators.

---

<div align="center">
  <p>Built with ❤️ for the Xandeum Community</p>
</div>
