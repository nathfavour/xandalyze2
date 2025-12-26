---
sidebar_position: 2
---

# 📖 Operator Usage Guide

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
- **Global Network Topology**: A real-time geographical map showing where pNodes are physically located. Glowing markers indicate active clusters, with size representing node density in that region.
- **Status Distribution**: A breakdown of node health (Active, Delinquent, Offline).

---

## 2. pNode Explorer

The **pNode Explorer** provides a granular view of every node in the network.

- **Search**: Use the search bar to find specific nodes by their **Identity Pubkey**, version, or location.
- **Sorting**: Click on any column header (e.g., Latency, Uptime) to sort the network by that metric.
- **AI Analysis**: Click the ✨ icon on any row to send that specific node's data to **Xandalyze AI** for a detailed health check.

---

## 3. Xandalyze AI

**Xandalyze AI** is your intelligent network architect, powered by advanced machine learning models. It lives in the resizable right sidebar.

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
To perform external analysis or keep historical records, use the **Export** button in the top header. This will download a timestamped JSON file containing the full state of all discovered pNodes.

### Refreshing Data
The dashboard automatically refreshes every 30 seconds. You can trigger a manual refresh at any time using the 🔄 button in the header.
