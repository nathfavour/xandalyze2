import { PNode, NodeStatus } from './types';

// Xandeum typically uses standard ports, but exact RPC endpoints for the hackathon might vary.
// We provide a default, but the app handles connection failures by showing mock data.
export const DEFAULT_RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.xandeum.com:8899";

export const MOCK_NODES: PNode[] = Array.from({ length: 45 }).map((_, i) => {
  const isUp = Math.random() > 0.1;
  const status = isUp ? NodeStatus.ACTIVE : (Math.random() > 0.5 ? NodeStatus.DELINQUENT : NodeStatus.OFFLINE);
  
  return {
    identityPubkey: `Xan${Math.random().toString(36).substring(2, 10).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    gossipAddr: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:8001`,
    rpcAddr: isUp ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:8899` : null,
    version: `1.14.${Math.floor(Math.random() * 20) + 10}`,
    shredVersion: 54321,
    status: status,
    latency: isUp ? Math.floor(Math.random() * 150) + 20 : 0,
    location: ['US-East', 'EU-Central', 'Asia-SE', 'US-West'][Math.floor(Math.random() * 4)],
    diskSpace: Math.floor(Math.random() * 100) + 10, // TB
    uptime: isUp ? 98 + Math.random() * 2 : Math.random() * 50,
  };
});

export const NAV_ITEMS = [
  { name: 'Dashboard', id: 'dashboard', icon: 'LayoutDashboard' },
  { name: 'pNodes', id: 'nodes', icon: 'Server' },
  { name: 'Network Map', id: 'map', icon: 'Map' },
  { name: 'AI Insights', id: 'ai', icon: 'Sparkles' },
];
