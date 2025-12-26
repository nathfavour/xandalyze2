# Xandalyze - Xandeum pNode Analytics Platform

## Overview
Xandalyze is a high-performance analytics dashboard designed specifically for the Xandeum network. It provides real-time monitoring of pNodes (storage provider nodes), visualizes network health, and utilizes GitHub Models (GPT-4o-mini) to generate actionable insights for network operators.

## Features
- **Real-time Dashboard**: Live metrics on node count, storage capacity, uptime, and latency.
- **pNode Registry**: A searchable, sortable registry of all nodes appearing in the gossip network.
- **Network Visualization**: Charts tracking status distribution and historical latency.
- **AI Architect**: Integrated GPT-4o-mini model that analyzes raw network data to produce human-readable health reports and optimization recommendations.
- **Resilience**: Automatic fallback to simulated data if the RPC endpoint is unreachable (useful for demos).

## Deployment

### Prerequisites
- Node.js (v18 or higher)
- A GitHub Token (for AI features)

### Local Development
1. **Clone the repository** to your local machine.
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Configure Environment**:
   Ensure your environment has access to the `GITHUB_TOKEN` variable for AI features.
4. **Start the development server**:
   ```bash
   pnpm run dev
   ```
   Open http://localhost:3000 (or the port shown in your terminal) to view the app.

### Production Deployment
This application is a Next.js application.

1. **Build the application**:
   ```bash
   pnpm run build
   ```
2. **Deploy**:
   Deploy to Vercel or any Node.js hosting provider.

**Note on Security**: The application uses a Next.js API route to proxy calls to GitHub Models, keeping your API key secure on the server.

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
3. This data is sent to the **GPT-4o-mini** model via GitHub Models.
4. Review the generated **Health Score** and **Recommendations** to improve network performance.

## Troubleshooting

### Why am I seeing mock data?
The application is configured to connect to the Xandeum devnet RPC. If this endpoint is offline, rate-limited, or blocked by CORS during your session, the app automatically falls back to a realistic simulation mode to ensure the UI remains functional for demonstration.

### AI Report fails to generate
Ensure that the `GITHUB_TOKEN` is correctly set in your environment variables.