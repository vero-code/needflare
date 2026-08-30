import React from 'react';
import { Radio } from 'lucide-react';
import type { AnonymizedReport, LogisticsTask } from '../types';

interface IncidentEventStreamProps {
  reports?: AnonymizedReport[];
  tasks?: LogisticsTask[];
}

export const IncidentEventStream: React.FC<IncidentEventStreamProps> = () => {
  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #33415550',
          paddingBottom: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
          <Radio size={16} color="#10b981" />
          Live Incident Event Stream (Gemma Edge ➔ Pub/Sub ➔ Gemini 3.7)
        </div>
        <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
          Real-time Pipeline Connected
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0f172a',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>JUST NOW</span>
            <span style={{ background: '#ef444420', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>
              SECTOR ALPHA
            </span>
            <span style={{ color: '#cbd5e1' }}>
              Gemma scrubbed 2 PII (Name, Phone) ➔ Gemini 3.7 evaluated: <strong>CRITICAL</strong> ➔ Task auto-dispatched
            </span>
          </div>
          <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600 }}>Payload: 30L Water + Pediatric Kits</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0f172a',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>18:45:10</span>
            <span style={{ background: '#8b5cf620', color: '#a78bfa', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>
              VEO ENGINE
            </span>
            <span style={{ color: '#cbd5e1' }}>
              Universal non-verbal video guide activated: <strong>Water Filtration Protocol</strong>
            </span>
          </div>
          <span style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600 }}>Broadcast: Active ON AIR</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0f172a',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>18:12:00</span>
            <span style={{ background: '#f59e0b20', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>
              SECTOR BRAVO
            </span>
            <span style={{ color: '#cbd5e1' }}>Tactical medical team deployed with 5kW emergency generator</span>
          </div>
          <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>Status: En Route</span>
        </div>
      </div>
    </div>
  );
};
