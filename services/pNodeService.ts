import { PNode } from '../types';
import { MOCK_NODES, DEFAULT_RPC_ENDPOINT } from '../constants';

// Simulator for fetching gossip nodes
// In a real Xandeum app, this would hit the `getClusterNodes` RPC method
export const fetchPNodes = async (endpoint: string = DEFAULT_RPC_ENDPOINT): Promise<PNode[]> => {
  try {
    // Attempt real fetch (will likely fail in demo env without a real CORS proxy or running node)
    // We set a short timeout to fall back quickly for the demo
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

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
    // Assuming standard Solana/Xandeum RPC response structure
    if (data.result) {
       // Transform RPC result to our PNode type if necessary
       // This part depends on the exact Xandeum RPC shape, assuming similarity to Solana
       return data.result as PNode[];
    }
    
    throw new Error('Invalid RPC result');

  } catch (err) {
    console.warn("Failed to connect to live Xandeum RPC, utilizing Mock Data for demo purposes.", err);
    // Simulate network delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_NODES;
  }
};
