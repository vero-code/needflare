import React from 'react';
import { AlertOctagon, Activity, Truck, Zap } from 'lucide-react';
import type { SectorZone, LogisticsTask } from '../types';

interface MetricsBannerProps {
  sectors: SectorZone[];
  tasks: LogisticsTask[];
}

export const MetricsBanner: React.FC<MetricsBannerProps> = ({ sectors, tasks }) => {
  const totalReports = sectors.reduce((sum, s) => sum + s.totalReportsCount, 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
      <div
        style={{
          background: '#1e293b',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ background: '#ef444420', color: '#ef4444', padding: '12px', borderRadius: '10px' }}>
          <AlertOctagon size={26} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Active Crisis Sectors</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>{sectors.length}</div>
        </div>
      </div>

      <div
        style={{
          background: '#1e293b',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ background: '#3b82f620', color: '#38bdf8', padding: '12px', borderRadius: '10px' }}>
          <Activity size={26} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Total Triage Reports</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>{totalReports}</div>
        </div>
      </div>

      <div
        style={{
          background: '#1e293b',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ background: '#10b98120', color: '#34d399', padding: '12px', borderRadius: '10px' }}>
          <Truck size={26} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Auto Logistics Tasks</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>{tasks.length}</div>
        </div>
      </div>

      <div
        style={{
          background: '#1e293b',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ background: '#8b5cf620', color: '#a78bfa', padding: '12px', borderRadius: '10px' }}>
          <Zap size={26} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Gemini 3.7 Agent Status</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
            Live Function Calling
          </div>
        </div>
      </div>
    </div>
  );
};
