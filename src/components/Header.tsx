import React from 'react';
import { Flame, Smartphone, LayoutDashboard, Video } from 'lucide-react';

type ActiveTab = 'field' | 'coordinator' | 'veo';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header
      style={{
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Flame size={24} color="#ffffff" />
        </div>
        <div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #f8fafc, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NeedFlare
          </div>
          <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>
            Gemma Edge • Gemini 3.7 Flash • Google Veo
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          background: '#1e293b',
          padding: '4px',
          borderRadius: '10px',
          gap: '4px',
        }}
      >
        <button
          onClick={() => onTabChange('coordinator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'coordinator' ? '#3b82f6' : 'transparent',
            color: activeTab === 'coordinator' ? '#fff' : '#94a3b8',
          }}
        >
          <LayoutDashboard size={16} />
          Coordinator Map & Triage
        </button>

        <button
          onClick={() => onTabChange('field')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'field' ? '#3b82f6' : 'transparent',
            color: activeTab === 'field' ? '#fff' : '#94a3b8',
          }}
        >
          <Smartphone size={16} />
          Volunteer Field Edge (Gemma)
        </button>

        <button
          onClick={() => onTabChange('veo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'veo' ? '#8b5cf6' : 'transparent',
            color: activeTab === 'veo' ? '#fff' : '#94a3b8',
          }}
        >
          <Video size={16} />
          Veo Visual Guides
        </button>
      </div>
    </header>
  );
};
