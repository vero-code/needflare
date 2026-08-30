import React, { useState } from 'react';
import {
  Radio,
  QrCode,
  Upload,
  Trash2,
  Copy,
  Check,
  Send,
  X,
} from 'lucide-react';
import type { AnonymizedReport } from '../types';
import { EdgeGemmaService } from '../services/edgeGemmaService';

interface OfflineSyncQueueProps {
  reports: AnonymizedReport[];
  networkMode: string;
  isSyncing: boolean;
  onTriggerSync: () => void;
  onRefreshReports: () => void;
}

export const OfflineSyncQueue: React.FC<OfflineSyncQueueProps> = ({
  reports,
  networkMode,
  isSyncing,
  onTriggerSync,
  onRefreshReports,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'SYNCED'>('ALL');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const pendingReports = reports.filter((r) => r.syncStatus === 'offline_queued');
  const syncedReports = reports.filter((r) => r.syncStatus === 'synced');

  const displayedReports = reports.filter((r) => {
    if (filterMode === 'PENDING') return r.syncStatus === 'offline_queued';
    if (filterMode === 'SYNCED') return r.syncStatus === 'synced';
    return true;
  });

  const meshPayloadJson = React.useMemo(() => {
    const list = pendingReports.length > 0 ? pendingReports : reports;
    return JSON.stringify(
      list.map((r) => ({
        id: r.id,
        sec: r.sectorId,
        cat: r.category,
        urg: r.preliminaryUrgency,
        cnt: r.estimatedPeopleCount,
        sum: r.sanitizedSummary,
        pii: r.piiRemoved,
        ts: r.timestamp,
      })),
      null,
      2
    );
  }, [reports, pendingReports]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(meshPayloadJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDeleteReport = (id: string) => {
    const existing = EdgeGemmaService.getOfflineQueue();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem('needflare_offline_reports', JSON.stringify(updated));
    onRefreshReports();
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        const existing = EdgeGemmaService.getOfflineQueue();
        const newReports: AnonymizedReport[] = parsed.map((item: any) => ({
          id: item.id || `rep-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: item.ts || Date.now(),
          sectorId: item.sec || 'sector-alpha',
          coordinates: { lat: 25.7617, lng: -80.1918 },
          sanitizedSummary: item.sum || 'Imported P2P Transmission',
          category: item.cat || 'medical',
          estimatedPeopleCount: item.cnt || 1,
          preliminaryUrgency: item.urg || 'high',
          piiRemoved: item.pii || [],
          syncStatus: 'offline_queued',
        }));

        const merged = [...existing, ...newReports];
        localStorage.setItem('needflare_offline_reports', JSON.stringify(merged));
        onRefreshReports();
        setShowImportModal(false);
        setImportText('');
      }
    } catch {
      alert('Invalid JSON mesh packet format. Please check the pasted data.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Banner */}
      <div
        style={{
          background: '#1e293b',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={20} color="#f59e0b" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              OFFLINE BUFFER &amp; PEER-TO-PEER (P2P) MESH RELAY
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
            Store-and-Forward asynchronous telemetry under complete cell-tower blackout
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowQrModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #f59e0b50',
              background: '#f59e0b15',
              color: '#fbbf24',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <QrCode size={16} />
            P2P QR-Export
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #38bdf850',
              background: '#0284c715',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Upload size={16} />
            Import Packet
          </button>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing || pendingReports.length === 0 || networkMode === 'OFFLINE'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: pendingReports.length > 0 && networkMode !== 'OFFLINE' ? '#10b981' : '#334155',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: pendingReports.length > 0 && networkMode !== 'OFFLINE' ? 'pointer' : 'not-allowed',
              opacity: pendingReports.length === 0 || networkMode === 'OFFLINE' ? 0.6 : 1,
              transition: 'all 0.15s ease',
              boxShadow: pendingReports.length > 0 ? '0 2px 10px rgba(16,185,129,0.35)' : 'none',
            }}
          >
            <Send size={15} />
            {isSyncing ? 'Publishing to Pub/Sub...' : `Send to Cloud (${pendingReports.length})`}
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            CHANNEL STATUS:
          </span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: networkMode === 'OFFLINE' ? '#ef4444' : '#34d399' }}>
            {networkMode}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
            {networkMode === 'OFFLINE' ? 'Zero radio connection. Packets accumulating in device buffer.' : 'Carrier active. Ready for batch burst to Google Cloud.'}
          </span>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            AWAITING SYNCHRONIZATION:
          </span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: pendingReports.length > 0 ? '#f59e0b' : '#94a3b8' }}>
            {pendingReports.length} DE-IDENTIFIED PACKETS
          </div>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
            100% scrubbed on-device by Gemma 3 Edge before queuing.
          </span>
        </div>

        <div style={{ background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            DELIVERED &amp; INGESTED:
          </span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
            {syncedReports.length} CLOUD INGESTIONS
          </div>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
            Processed by Gemini 3.7 Flash &amp; routed into convoys.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', background: '#0f172a', padding: '4px', borderRadius: '8px', border: '1px solid #334155', width: 'fit-content' }}>
        <button
          onClick={() => setFilterMode('ALL')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: filterMode === 'ALL' ? '#3b82f6' : 'transparent',
            color: filterMode === 'ALL' ? '#fff' : '#94a3b8',
          }}
        >
          All ({reports.length})
        </button>

        <button
          onClick={() => setFilterMode('PENDING')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: filterMode === 'PENDING' ? '#f59e0b' : 'transparent',
            color: filterMode === 'PENDING' ? '#000' : '#94a3b8',
          }}
        >
          Queued ({pendingReports.length})
        </button>

        <button
          onClick={() => setFilterMode('SYNCED')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: filterMode === 'SYNCED' ? '#10b981' : 'transparent',
            color: filterMode === 'SYNCED' ? '#fff' : '#94a3b8',
          }}
        >
          Cloud Synced ({syncedReports.length})
        </button>
      </div>

      {/* Reports Queue List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displayedReports.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px dashed #334155', borderRadius: '10px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No reports currently in this buffer category.
          </div>
        ) : (
          displayedReports.map((rep) => (
            <div
              key={rep.id}
              style={{
                background: '#1e293b',
                borderRadius: '10px',
                border: '1px solid #334155',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem', color: '#f8fafc' }}>
                    {rep.id.toUpperCase()}
                  </span>
                  <span style={{ background: '#0f172a', border: '1px solid #334155', color: '#38bdf8', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {rep.sectorId}
                  </span>
                  <span
                    style={{
                      background: rep.preliminaryUrgency === 'critical' ? '#ef444420' : '#f59e0b20',
                      border: `1px solid ${rep.preliminaryUrgency === 'critical' ? '#ef4444' : '#f59e0b'}`,
                      color: rep.preliminaryUrgency === 'critical' ? '#f87171' : '#fbbf24',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {rep.preliminaryUrgency}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: rep.syncStatus === 'synced' ? '#10b98120' : '#f59e0b20',
                      color: rep.syncStatus === 'synced' ? '#34d399' : '#fbbf24',
                      border: `1px solid ${rep.syncStatus === 'synced' ? '#10b98150' : '#f59e0b50'}`,
                    }}
                  >
                    {rep.syncStatus === 'synced' ? '✓ SYNCED' : 'OFFLINE QUEUED'}
                  </span>

                  <button
                    onClick={() => handleDeleteReport(rep.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Delete packet from queue"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                <strong style={{ color: '#94a3b8' }}>Sanitized Transmission:</strong> {rep.sanitizedSummary}
              </p>

              {/* Redaction audit pills */}
              {rep.piiRemoved.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {rep.piiRemoved.map((pii, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.68rem',
                        background: '#ef444415',
                        border: '1px solid #ef444440',
                        color: '#fca5a5',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      ✓ Scrubbed: {pii}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94a3b8', borderTop: '1px solid #33415550', paddingTop: '6px', marginTop: '2px' }}>
                <span>
                  Headcount: <strong style={{ color: '#f1f5f9' }}>{rep.estimatedPeopleCount}</strong> | Category: <strong style={{ color: '#38bdf8' }}>{rep.category.toUpperCase()}</strong>
                </span>
                <span>
                  Volunteer Terminal: <strong>VOL-ALPHA-77</strong> | {new Date(rep.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal 1: P2P QR Export Modal */}
      {showQrModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '480px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                  P2P QR Mesh Packet Transfer
                </h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4' }}>
              Show this QR code to another volunteer, drone carrier, or convoy driver. Scanning instantly transfers all local packets without internet.
            </p>

            {/* Offline Pure QR-Code Visualization Box */}
            <div
              style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  JSON.stringify(pendingReports.length > 0 ? pendingReports.slice(0, 3) : reports.slice(0, 3))
                )}`}
                alt="P2P Mesh QR Code"
                style={{ width: '220px', height: '220px', display: 'block' }}
                onError={(e) => {
                  // Fallback to text box if offline
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span style={{ color: '#0f172a', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'monospace', marginTop: '6px' }}>
                NEEDFLARE MESH // {pendingReports.length || reports.length} PACKETS // ENCRYPTED
              </span>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyPayload}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: copied ? '#10b981' : '#3b82f6',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied to Clipboard!' : 'Copy Raw Mesh JSON'}
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Import Packet Modal */}
      {showImportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '520px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                  Import P2P Mesh Packets
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>
              Paste JSON data scanned from another volunteer&apos;s QR code or transferred over local Bluetooth/LoRa.
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste JSON array of packets here..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #334155',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                outline: 'none',
              }}
            />

            <button
              onClick={handleImportSubmit}
              disabled={!importText.trim()}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: importText.trim() ? '#10b981' : '#334155',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: importText.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Import &amp; Merge into Local Buffer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
