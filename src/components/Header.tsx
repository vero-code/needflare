import React, { useState } from 'react';
import {
  Flame,
  Radio,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  FileText,
  BatteryCharging,
  Send,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export type NetworkMode = 'OFFLINE' | 'WEAK_LORA' | 'BURST_SATELLITE' | 'ONLINE_4G';
export type DisplayTheme = 'HIGH_CONTRAST_SOLAR' | 'AMOLED_TACTICAL' | 'MONOCHROME_EINK';

interface HeaderProps {
  networkMode: NetworkMode;
  onNetworkModeChange: (mode: NetworkMode) => void;
  pendingQueueCount: number;
  isSyncing: boolean;
  onTriggerSync: () => void;
  onOpenPiiInspector: () => void;
  onOpenCopilot: () => void;
  callsign?: string;
  displayTheme?: DisplayTheme;
  onThemeChange?: (theme: DisplayTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  networkMode,
  onNetworkModeChange,
  pendingQueueCount,
  isSyncing,
  onTriggerSync,
  onOpenPiiInspector,
  onOpenCopilot,
  displayTheme = 'AMOLED_TACTICAL',
  onThemeChange,
}) => {
  const [internalTheme, setInternalTheme] = useState<DisplayTheme>(displayTheme);
  const currentTheme = displayTheme || internalTheme;

  const handleThemeSwitch = (theme: DisplayTheme) => {
    setInternalTheme(theme);
    onThemeChange?.(theme);
  };

  const getNetworkBadge = () => {
    switch (networkMode) {
      case 'OFFLINE':
        return {
          label: 'OFFLINE (0 kbps)',
          badgeBg: '#ef444420',
          badgeColor: '#f87171',
          badgeBorder: '#ef444450',
          icon: <WifiOff size={13} color="#f87171" />,
          desc: 'Zero connectivity mode. Reports queue securely in local on-device flash storage.',
          syncAllowed: false,
        };
      case 'WEAK_LORA':
        return {
          label: 'LORA MESH (9.6 kbps)',
          badgeBg: '#f59e0b20',
          badgeColor: '#fbbf24',
          badgeBorder: '#f59e0b50',
          icon: <Radio size={13} color="#fbbf24" />,
          desc: 'Low-speed volunteer radio mesh network. Compact compressed packets only.',
          syncAllowed: true,
        };
      case 'BURST_SATELLITE':
        return {
          label: 'STARLINK BURST (64 kbps)',
          badgeBg: '#06b6d420',
          badgeColor: '#38bdf8',
          badgeBorder: '#06b6d450',
          icon: <Radio size={13} color="#38bdf8" />,
          desc: 'Intermittent orbital satellite link. Scheduled burst synchronization.',
          syncAllowed: true,
        };
      case 'ONLINE_4G':
      default:
        return {
          label: 'NET 4G/5G ONLINE',
          badgeBg: '#10b98120',
          badgeColor: '#34d399',
          badgeBorder: '#10b98150',
          icon: <Wifi size={13} color="#34d399" />,
          desc: 'Full-speed direct pipeline to Google Cloud AI.',
          syncAllowed: true,
        };
    }
  };

  const netBadge = getNetworkBadge();

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      {/* 1. Main Header Bar */}
      <header
        style={{
          background: '#0f172a',
          borderBottom: '1px solid #1e293b',
          padding: '0.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Left: Original Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
            }}
          >
            <Flame size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 850,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(to right, #f8fafc, #94a3b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NeedFlare
              </div>
              <span
                style={{
                  background: '#f59e0b20',
                  color: '#fbbf24',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '6px',
                  border: '1px solid #f59e0b40',
                }}
              >
                v2.4 HQ
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>
              Gemma Edge • Google Cloud Pub/Sub • Gemini 3.7 Flash • Google Veo
            </div>
          </div>
        </div>

        {/* Right: Command Controls in Sleek Dark Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Link / Network Mode Selector */}
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
              title="Zero connectivity (Offline store & forward)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 9px',
                borderRadius: '6px',
                border: 'none',
                background: networkMode === 'OFFLINE' ? '#dc2626' : 'transparent',
                color: networkMode === 'OFFLINE' ? '#ffffff' : '#94a3b8',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <WifiOff size={12} />
              OFFLINE
            </button>

            <button
              onClick={() => onNetworkModeChange('WEAK_LORA')}
              title="LoRa Emergency Packet Radio Mesh (9.6 kbps)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 9px',
                borderRadius: '6px',
                border: 'none',
                background: networkMode === 'WEAK_LORA' ? '#d97706' : 'transparent',
                color: networkMode === 'WEAK_LORA' ? '#ffffff' : '#94a3b8',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Radio size={12} />
              LORA
            </button>

            <button
              onClick={() => onNetworkModeChange('BURST_SATELLITE')}
              title="Burst Satellite Uplink (Starlink / Iridium)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 9px',
                borderRadius: '6px',
                border: 'none',
                background: networkMode === 'BURST_SATELLITE' ? '#0284c7' : 'transparent',
                color: networkMode === 'BURST_SATELLITE' ? '#ffffff' : '#94a3b8',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Radio size={12} />
              SAT
            </button>

            <button
              onClick={() => onNetworkModeChange('ONLINE_4G')}
              title="Full speed direct 4G/5G broadband"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 9px',
                borderRadius: '6px',
                border: 'none',
                background: networkMode === 'ONLINE_4G' ? '#059669' : 'transparent',
                color: networkMode === 'ONLINE_4G' ? '#ffffff' : '#94a3b8',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Wifi size={12} />
              4G ON
            </button>
          </div>

          {/* Sync Trigger Button */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing || !netBadge.syncAllowed}
            title={
              !netBadge.syncAllowed
                ? 'Sync disabled in OFFLINE mode. Switch to LORA, SAT or 4G to upload.'
                : 'Upload pending reports to Google Cloud'
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: !netBadge.syncAllowed ? '#334155' : pendingQueueCount > 0 ? '#fbbf24' : '#38bdf8',
              background: !netBadge.syncAllowed
                ? '#1e293b'
                : pendingQueueCount > 0
                ? '#f59e0b'
                : '#0284c7',
              color: !netBadge.syncAllowed
                ? '#64748b'
                : pendingQueueCount > 0
                ? '#000000'
                : '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: !netBadge.syncAllowed ? 'not-allowed' : 'pointer',
              opacity: !netBadge.syncAllowed ? 0.5 : 1,
              boxShadow:
                pendingQueueCount > 0 && netBadge.syncAllowed
                  ? '0 0 12px rgba(245, 158, 11, 0.4)'
                  : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {isSyncing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>SYNCING...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>SYNC {pendingQueueCount > 0 ? `(${pendingQueueCount})` : ''}</span>
              </>
            )}
          </button>

          {/* AI HQ Button */}
          <button
            onClick={onOpenCopilot}
            title="Open Gemini 3.7 Disaster Copilot"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#1e293b',
              border: '1px solid #8b5cf660',
              color: '#c4b5fd',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(139, 92, 246, 0.15)',
            }}
          >
            <Sparkles size={14} color="#a78bfa" />
            <span>AI-HQ</span>
          </button>

          {/* PII Filter Button */}
          <button
            onClick={onOpenPiiInspector}
            title="Inspect Client-Side Zero-PII Protocol"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#1e293b',
              border: '1px solid #10b98160',
              color: '#6ee7b7',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)',
            }}
          >
            <FileText size={14} color="#34d399" />
            <span>PII-FILTER</span>
          </button>

          {/* Theme Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '2px',
              gap: '2px',
            }}
          >
            <button
              onClick={() => handleThemeSwitch('HIGH_CONTRAST_SOLAR')}
              title="Solar High-Contrast (Daylight)"
              style={{
                padding: '5px 7px',
                borderRadius: '6px',
                border: 'none',
                background: currentTheme === 'HIGH_CONTRAST_SOLAR' ? '#3b82f6' : 'transparent',
                color: currentTheme === 'HIGH_CONTRAST_SOLAR' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Sun size={13} />
            </button>

            <button
              onClick={() => handleThemeSwitch('AMOLED_TACTICAL')}
              title="AMOLED Tactical Dark"
              style={{
                padding: '5px 7px',
                borderRadius: '6px',
                border: 'none',
                background: currentTheme === 'AMOLED_TACTICAL' ? '#3b82f6' : 'transparent',
                color: currentTheme === 'AMOLED_TACTICAL' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Moon size={13} />
            </button>

            <button
              onClick={() => handleThemeSwitch('MONOCHROME_EINK')}
              title="Monochrome E-Ink Mode"
              style={{
                padding: '3px 7px',
                borderRadius: '6px',
                border: 'none',
                background: currentTheme === 'MONOCHROME_EINK' ? '#ffffff' : 'transparent',
                color: currentTheme === 'MONOCHROME_EINK' ? '#000000' : '#94a3b8',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              E-INK
            </button>
          </div>
        </div>
      </header>

      {/* 2. Network Status Sub-Bar */}
      <div
        style={{
          background: '#090d16',
          borderBottom: '1px solid #1e293b',
          padding: '0.45rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.75rem',
        }}
      >
        {/* Left: Dynamic Network Mode Badge & Explanation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.7rem',
              background: netBadge.badgeBg,
              color: netBadge.badgeColor,
              border: `1px solid ${netBadge.badgeBorder}`,
            }}
          >
            {netBadge.icon}
            {netBadge.label}
          </span>
          <span style={{ color: '#cbd5e1' }}>
            {netBadge.desc}
          </span>
        </div>

        {/* Right: Telemetry, Battery & Outbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
            <BatteryCharging size={14} color="#10b981" />
            <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>BATTERY: 78% (POWER SAVER)</span>
          </div>
          <span style={{ color: '#334155' }}>|</span>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            BUFFER: <strong style={{ color: pendingQueueCount > 0 ? '#fbbf24' : '#34d399' }}>{pendingQueueCount} PACKETS</strong>
          </div>
        </div>
      </div>
    </div>
  );
};


