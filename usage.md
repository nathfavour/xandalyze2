# Xandalyze - Xandeum pNode Analytics Platform

## Overview
Xandalyze is a high-performance analytics dashboard designed specifically for the Xandeum network. It provides real-time monitoring of pNodes (storage provider nodes), visualizes network health, and utilizes Google Gemini AI to generate actionable insights for network operators.

## Features
- **Real-time Dashboard**: Live metrics on node count, storage capacity, uptime, and latency.
- **pNode Registry**: A searchable, sortable registry of all nodes appearing in the gossip network.
- **Network Visualization**: Charts tracking status distribution and historical latency.
- **AI Architect**: Integrated Gemini 2.5 Flash model that analyzes raw network data to produce human-readable health reports and optimization recommendations.
- **Resilience**: Automatic fallback to simulated data if the RPC endpoint is unreachable (useful for demos).

## Deployment

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key (for AI features)

### Local Development
1. **Clone the repository** to your local machine.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Ensure your environment has access to the `API_KEY` variable for Gemini features.
4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open http://localhost:8080 (or the port shown in your terminal) to view the app.

### Production Deployment
This application is a static React Single Page Application (SPA).

1. **Build the application**:
   ```bash
   npm run build
   ```
2. **Deploy**:
   Upload the contents of the `dist` (or `build`) directory to any static hosting provider, such as:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

**Note on Security**: For a production environment, it is recommended to proxy calls to the Gemini API through a backend server to keep your API key secure, rather than exposing it in the frontend code.

## Usage Guide

### Navigation
Use the sidebar to navigate between views:
- **Dashboard**: High-level overview and charts.
- **pNodes**: Detailed list of individual nodes.
- **AI Insights**: Generate on-demand reports.

### Interpreting Data
- **Status**:
  - `Active`: Node is responsive and voting.
  - `Delinquent`: Node is visible but falling behind or missing votes.
  - `Offline`: Node has dropped out of gossip.
- **Latency**: Measured in milliseconds. Lower is better. Green (<50ms), Yellow (<150ms), Red (>150ms).

### Using AI Insights
1. Click the **AI Insights** button in the sidebar.
2. The system will aggregate current metrics (version distribution, average latency, node statuses).
3. This data is sent to the **Gemini 2.5 Flash** model.
4. Review the generated **Health Score** and **Recommendations** to improve network performance.

## Troubleshooting

### Why am I seeing mock data?
The application is configured to connect to `https://rpc.xandeum.network`. If this endpoint is offline, rate-limited, or blocked by CORS during your session, the app automatically falls back to a realistic simulation mode to ensure the UI remains functional for demonstration.

### AI Report fails to generate
Ensure that the `process.env.API_KEY` is correctly set in your build environment. If running locally without a `.env` setup, the AI features may be disabled.