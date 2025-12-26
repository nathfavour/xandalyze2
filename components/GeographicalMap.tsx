'use client';

import React, { useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Sphere,
  Graticule
} from 'react-simple-maps';
import { PNode } from '../types';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mapping locations to approximate coordinates
const LOCATION_COORDS: Record<string, [number, number]> = {
  'US-East': [-74.006, 40.7128],
  'EU-Central': [13.405, 52.52],
  'Asia-SE': [103.8198, 1.3521],
  'US-West': [-122.4194, 37.7749],
  'EU-West': [-0.1278, 51.5074],
  'SA-East': [-46.6333, -23.5505],
};

export const GeographicalMap = ({ nodes }: { nodes: PNode[] }) => {
  const markers = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach(node => {
      if (node.location) {
        counts[node.location] = (counts[node.location] || 0) + 1;
      }
    });

    return Object.entries(LOCATION_COORDS).map(([name, coords]) => ({
      name,
      coordinates: coords,
      count: counts[name] || 0,
    })).filter(m => m.count > 0);
  }, [nodes]);

  return (
    <div className="w-full h-full bg-[#050505] rounded-3xl border border-white/5 overflow-hidden relative group">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Global pNode Topology
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Distribution</p>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Active Cluster</span>
        </div>
      </div>

      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147
        }}
        className="w-full h-full"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <Sphere id="rsm-sphere" stroke="#1e293b" strokeWidth={0.5} fill="transparent" />
        <Graticule id="rsm-graticule" stroke="#1e293b" strokeWidth={0.3} />
        
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#1e293b", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {markers.map(({ name, coordinates, count }) => (
          <Marker key={name} coordinates={coordinates as [number, number]}>
            <g filter="url(#glow)">
              <circle
                r={4 + Math.min(count * 0.5, 10)}
                fill="rgba(99, 102, 241, 0.4)"
                className="animate-ping"
              />
              <circle
                r={2 + Math.min(count * 0.3, 6)}
                fill="#6366f1"
                stroke="#fff"
                strokeWidth={1}
              />
            </g>
            <text
              textAnchor="middle"
              y={-15}
              style={{ 
                fontFamily: "system-ui", 
                fill: "#94a3b8", 
                fontSize: "8px", 
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}
            >
              {name} ({count})
            </text>
          </Marker>
        ))}
      </ComposableMap>
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60"></div>
    </div>
  );
};
