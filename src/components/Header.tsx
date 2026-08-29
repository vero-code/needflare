import React from 'react';
import { Flame, Shield } from 'lucide-react';

export const Header: React.FC = () => {
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

      {/* Status Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#1e293b80',
          border: '1px solid #334155',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#94a3b8',
        }}
      >
        <Shield size={14} color="#10b981" />
        <span>Crisis Response Network Active</span>
      </div>
    </header>
  );
};
