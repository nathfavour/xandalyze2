export enum NodeStatus {
  ACTIVE = 'Active',
  DELINQUENT = 'Delinquent',
  OFFLINE = 'Offline',
  BOOTSTRAP = 'Bootstrap'
}

export interface PNode {
  identityPubkey: string; // The Node ID
  gossipAddr: string;
  rpcAddr: string | null;
  version: string | null;
  shredVersion: number | null;
  status: NodeStatus;
  latency: number; // ms
  location?: string; // Derived from IP (simulated for now)
  diskSpace?: number; // Total TB available (simulated)
  uptime?: number; // %
}

export interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  totalStorage: number; // TB
  avgLatency: number; // ms
}

export interface SortConfig {
  key: keyof PNode;
  direction: 'asc' | 'desc';
}

export interface AIReport {
  summary: string;
  healthScore: number;
  recommendations: string[];
}
