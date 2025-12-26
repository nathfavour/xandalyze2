# Xandalyze: Operator Usage Guide

Welcome to **Xandalyze**, the high-performance analytics platform for Xandeum pNodes. This guide will help you navigate the dashboard and leverage our AI-powered insights to optimize your storage provider infrastructure.

---

## 1. Dashboard Overview

The **Dashboard** is your mission control. It provides a high-level summary of the entire Xandeum gossip network.

- **Total pNodes**: The total number of storage providers currently visible in the gossip network.
- **Active Nodes**: Percentage of nodes that are currently voting and responsive.
- **Storage Capacity**: The aggregate storage available across all discovered pNodes.
- **Avg Latency**: The network-wide average response time.

### Visualizations
- **Network Latency (24h)**: Tracks the stability of the network over time. Spikes here may indicate regional network congestion.
- **Status Distribution**: A breakdown of node health (Active, Delinquent, Offline).

---

## 2. pNode Explorer

The **pNode Explorer** (accessible via the server icon in the sidebar) provides a granular view of every node in the network.

- **Search**: Use the search bar to find specific nodes by their **Identity Pubkey**, version, or location.
- **Sorting**: Click on any column header (e.g., Latency, Uptime) to sort the network by that metric.
- **AI Analysis**: Click the ✨ icon on any row to send that specific node's data to **Xandalyze AI** for a detailed health check.

---

## 3. Xandalyze AI

**Xandalyze AI** is your intelligent network architect, powered by GitHub Models (\`gpt-4o-mini\`). It lives in the resizable right sidebar.

### Dynamic Insights
The top of the AI sidebar features **Dynamic Insights**. These are calculated instantly from live network data:
- **Network Alerts**: Immediate notification if nodes drop offline.
- **Performance Vectors**: Real-time assessment of latency health.
- **Capacity Tracking**: Monitoring of total network storage growth.

### AI Commands
You can interact with the AI using natural language. Try these suggestions:
- *"Analyze the health of the network"*
- *"Which nodes have the highest latency?"*
- *"Summarize the storage capacity of the current epoch"*

---

## 4. Data Management

### Exporting Data
To perform external analysis or keep historical records, use the **Export JSON** button in the top header. This will download a timestamped JSON file containing the full state of all discovered pNodes.

### Refreshing Data
The dashboard automatically refreshes every 30 seconds. You can trigger a manual refresh at any time using the 🔄 button in the header.

---

## 5. Troubleshooting

### "Mock Data" Warning
If Xandalyze cannot reach the Xandeum pRPC endpoint (due to network issues or rate limiting), it will automatically switch to **Simulation Mode**. This ensures you can still explore the UI and AI features using realistic synthetic data.

### AI Sidebar is Empty
Ensure your \`GITHUB_TOKEN\` is correctly configured in your environment. If the AI fails to respond, check the "Dynamic Insights" section for local data analysis.
