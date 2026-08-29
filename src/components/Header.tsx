import React from 'react';
import {
  Flame,
  ShieldCheck,
  Sparkles,
  Wifi,
  WifiOff,
  Radio,
  BatteryCharging,
} from 'lucide-react';

export type NetworkMode = 'OFFLINE' | 'WEAK_LORA' | 'BURST_SATELLITE' | 'ONLINE_4G';

interface HeaderProps {
  networkMode: NetworkMode;
  onNetworkModeChange: (mode: NetworkMode) => void;
  onOpenPiiInspector: () => void;
  onOpenCopilot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  networkMode,
  onNetworkModeChange,
  onOpenPiiInspector,
  onOpenCopilot,
}) => {
  return (
    <header
      style={{
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '0.65rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      {/* Left: Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            padding: '7px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Flame size={22} color="#ffffff" />
        </div>
        <div>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #f8fafc, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NeedFlare
          </div>
          <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 600 }}>
            Gemma Edge • Gemini 3.7 Flash • Google Veo
          </div>
        </div>
      </div>

      {/* Right: Mission-Critical Action Tools & Telemetry */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        
        {/* Network Uplink Mode Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#1e293b',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #334155',
            gap: '2px',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, padding: '0 6px' }}>
            LINK:
          </span>

          <button
            onClick={() => onNetworkModeChange('OFFLINE')}
            title="Zero connectivity: Store reports locally"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '5px',
              border: 'none',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: networkMode === 'OFFLINE' ? '#dc2626' : 'transparent',
              color: networkMode === 'OFFLINE' ? '#fff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <WifiOff size={12} />
            OFFLINE
          </button>

          <button
            onClick={() => onNetworkModeChange('WEAK_LORA')}
            title="LoRa Emergency Packet Radio Mesh"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '5px',
              border: 'none',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: networkMode === 'WEAK_LORA' ? '#d97706' : 'transparent',
              color: networkMode === 'WEAK_LORA' ? '#fff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <Radio size={12} />
            LORA
          </button>

          <button
            onClick={() => onNetworkModeChange('BURST_SATELLITE')}
            title="Burst Satellite Uplink (Iridium/Starlink)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '5px',
              border: 'none',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: networkMode === 'BURST_SATELLITE' ? '#0284c7' : 'transparent',
              color: networkMode === 'BURST_SATELLITE' ? '#fff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <Radio size={12} />
            SAT
          </button>

          <button
            onClick={() => onNetworkModeChange('ONLINE_4G')}
            title="Direct 4G/5G Cellular & Broadband"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '5px',
              border: 'none',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: networkMode === 'ONLINE_4G' ? '#059669' : 'transparent',
              color: networkMode === 'ONLINE_4G' ? '#fff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            <Wifi size={12} />
            4G ON
          </button>
        </div>

        {/* AI Copilot Quick Action Button */}
        <button
          onClick={onOpenCopilot}
          title="Open Gemini 3.7 Disaster Copilot"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#1e293b',
            border: '1px solid #8b5cf660',
            color: '#c4b5fd',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(139, 92, 246, 0.2)',
          }}
        >
          <Sparkles size={14} color="#a78bfa" />
          <span>AI Copilot</span>
        </button>

        {/* PII Protocol Audit Button */}
        <button
          onClick={onOpenPiiInspector}
          title="Inspect Gemma Client-Side PII Scrubbing Rules"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#1e293b',
            border: '1px solid #10b98160',
            color: '#6ee7b7',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)',
          }}
        >
          <ShieldCheck size={14} color="#34d399" />
          <span>PII Protocol</span>
        </button>

        {/* Battery & Power Telemetry */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#1e293b80',
            border: '1px solid #334155',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <BatteryCharging size={14} color="#10b981" />
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>84%</span>
        </div>
      </div>
    </header>
  );
};

