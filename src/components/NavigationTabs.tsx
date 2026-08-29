import React from 'react';
import { LayoutDashboard, Smartphone, Video } from 'lucide-react';

export type MainTab = 'field' | 'coordinator' | 'veo';

interface NavigationTabsProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
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
        <button
          onClick={() => onTabChange('coordinator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'coordinator' ? '#3b82f6' : '#0f172a',
            color: activeTab === 'coordinator' ? '#fff' : '#94a3b8',
            boxShadow: activeTab === 'coordinator' ? '0 2px 8px rgba(59,130,246,0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <LayoutDashboard size={18} />
          Coordinator Map &amp; Triage
        </button>

        <button
          onClick={() => onTabChange('field')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'field' ? '#3b82f6' : '#0f172a',
            color: activeTab === 'field' ? '#fff' : '#94a3b8',
            boxShadow: activeTab === 'field' ? '0 2px 8px rgba(59,130,246,0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Smartphone size={18} />
          Volunteer Field Edge (Gemma)
        </button>

        <button
          onClick={() => onTabChange('veo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'veo' ? '#8b5cf6' : '#0f172a',
            color: activeTab === 'veo' ? '#fff' : '#94a3b8',
            boxShadow: activeTab === 'veo' ? '0 2px 8px rgba(139,92,246,0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Video size={18} />
          Veo Visual Guides
        </button>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
        Mode:{' '}
        <span style={{ color: '#38bdf8' }}>
          {activeTab === 'coordinator'
            ? 'HQ Coordination'
            : activeTab === 'field'
            ? 'Field Terminal (Offline Ready)'
            : 'Universal Broadcast'}
        </span>
      </div>
    </div>
  );
};
