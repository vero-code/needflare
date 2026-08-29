import React from 'react';
import { Radio, Map, Layers, Video } from 'lucide-react';

export type MainTab = 'field' | 'coordinator' | 'buffer' | 'veo';

interface NavigationTabsProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  pendingQueueCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  pendingQueueCount = 0,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: '#1e293b',
        padding: '8px 12px',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* 1. Field Intake ((o)) */}
        <button
          onClick={() => onTabChange('field')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'field' ? '#3b82f6' : '#0f172a',
            color: activeTab === 'field' ? '#fff' : '#94a3b8',
            boxShadow: activeTab === 'field' ? '0 2px 8px rgba(59,130,246,0.35)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Radio size={16} />
          <span>1. Field Intake (Gemma)</span>
          <span
            style={{
              fontSize: '0.65rem',
              background: activeTab === 'field' ? '#0f172a' : '#1e293b',
              color: activeTab === 'field' ? '#38bdf8' : '#64748b',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
            }}
          >
            FIELD
          </span>
        </button>

        {/* 2. Coordinator Map & Triage (Map icon) */}
        <button
          onClick={() => onTabChange('coordinator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'coordinator' ? '#3b82f6' : '#0f172a',
            color: activeTab === 'coordinator' ? '#fff' : '#94a3b8',
            boxShadow: activeTab === 'coordinator' ? '0 2px 8px rgba(59,130,246,0.35)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Map size={16} />
          <span>2. Coordinator Map &amp; Triage</span>
          <span
            style={{
              fontSize: '0.65rem',
              background: activeTab === 'coordinator' ? '#0f172a' : '#1e293b',
              color: activeTab === 'coordinator' ? '#38bdf8' : '#64748b',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
            }}
          >
            GRID
          </span>
        </button>

        {/* 3. Offline Buffer & P2P (Layers icon) */}
        <button
          onClick={() => onTabChange('buffer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'buffer' ? '#f59e0b' : '#0f172a',
            color: activeTab === 'buffer' ? '#000' : '#94a3b8',
            boxShadow: activeTab === 'buffer' ? '0 2px 8px rgba(245,158,11,0.35)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={16} />
          <span>3. Offline Buffer &amp; P2P</span>
          <span
            style={{
              fontSize: '0.65rem',
              background: activeTab === 'buffer' ? '#000000' : '#1e293b',
              color: activeTab === 'buffer' ? '#f59e0b' : '#fbbf24',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
            }}
          >
            {pendingQueueCount} IN QUEUE
          </span>
        </button>

        {/* 4. Veo Visual Guides (Video icon) */}
        <button
          onClick={() => onTabChange('veo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'veo' ? '#8b5cf6' : '#0f172a',
            color: activeTab === 'veo' ? '#fff' : '#94a3b8',
            boxShadow: activeTab === 'veo' ? '0 2px 8px rgba(139,92,246,0.35)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Video size={16} />
          <span>4. Veo Visual Guides</span>
          <span
            style={{
              fontSize: '0.65rem',
              background: activeTab === 'veo' ? '#0f172a' : '#1e293b',
              color: activeTab === 'veo' ? '#c084fc' : '#64748b',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
            }}
          >
            VEO-2
          </span>
        </button>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
        Active Mode:{' '}
        <span style={{ color: '#38bdf8' }}>
          {activeTab === 'field'
            ? '1. Field Terminal (Gemma On-Device)'
            : activeTab === 'coordinator'
            ? '2. HQ Incident Map & Triage'
            : activeTab === 'buffer'
            ? '3. Store & Forward Mesh Relay'
            : '4. Universal Broadcast'}
        </span>
      </div>
    </div>
  );
};
