import { PNode, NodeStatus } from '../types';
import { MOCK_NODES, DEFAULT_RPC_ENDPOINT } from '../constants';

// Simulator for fetching gossip nodes
// In a real Xandeum app, this would hit the `getClusterNodes` RPC method
export const fetchPNodes = async (endpoint: string = DEFAULT_RPC_ENDPOINT): Promise<PNode[]> => {
  try {
    // Attempt real fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getClusterNodes',
        params: []
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('RPC Failed');
    }

    const data = await response.json();
    
    if (data.result && Array.isArray(data.result)) {
       // Transform RPC result to our PNode type
       return data.result.map((node: { pubkey: string; gossip: string; rpc: string | null; version: string | null; shredVersion: number | null }) => {
         const ip = node.gossip?.split(':')[0] || '0.0.0.0';
         
         // Simple deterministic location based on IP for demo consistency
         const locations = ['US-East', 'EU-Central', 'Asia-SE', 'US-West', 'EU-West', 'SA-East'];
         const locIndex = ip.split('.').reduce((acc: number, part: string) => acc + parseInt(part), 0) % locations.length;

         return {
           identityPubkey: node.pubkey,
           gossipAddr: node.gossip,
           rpcAddr: node.rpc,
           version: node.version || 'Unknown',
           shredVersion: node.shredVersion || 0,
           status: NodeStatus.ACTIVE, // If they are in gossip, they are active
           latency: Math.floor(Math.random() * 100) + 20, // Simulated latency
           location: locations[locIndex],
           diskSpace: Math.floor(Math.random() * 80) + 20, // Simulated TB
           uptime: 95 + Math.random() * 5 // Simulated %
         };
       });
    }
    
    throw new Error('Invalid RPC result');

  } catch (err) {
    console.warn("Failed to connect to live Xandeum RPC, utilizing Mock Data for demo purposes.", err);
    // Simulate network delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_NODES;
  }
};
