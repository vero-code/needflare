import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Smartphone, Radio, UserCircle2 } from 'lucide-react';
import { EdgeGemmaService } from '../services/edgeGemmaService';
import { ReportInputForm, type FormReportPayload } from './ReportInputForm';
import { ScrubbedReportCard } from './ScrubbedReportCard';
import { OfflineQueueList } from './OfflineQueueList';
import type { RawFieldReport, AnonymizedReport, NetworkMode } from '../types';

const CALLSIGN_KEY = 'needflare_callsign';

interface VolunteerEdgeViewProps {
  networkMode: NetworkMode;
  onSyncBatchToCloud: (reports: AnonymizedReport[]) => void;
  onQueueChange?: () => void;
}

export const VolunteerEdgeView: React.FC<VolunteerEdgeViewProps> = ({
  networkMode,
  onSyncBatchToCloud,
  onQueueChange,
}) => {
  const [volunteerId, setVolunteerId] = useState<string>(
    () => sessionStorage.getItem(CALLSIGN_KEY) || ''
  );
  const [callsignInput, setCallsignInput] = useState<string>('');
  const [isProcessingGemma, setIsProcessingGemma] = useState<boolean>(false);
  const [lastProcessedReport, setLastProcessedReport] = useState<AnonymizedReport | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<AnonymizedReport[]>([]);

  useEffect(() => {
    setOfflineQueue(EdgeGemmaService.getOfflineQueue());
  }, []);

  const handleSetCallsign = () => {
    const trimmed = callsignInput.trim().toUpperCase().replace(/[^A-Z0-9-_]/g, '');
    if (!trimmed) return;
    sessionStorage.setItem(CALLSIGN_KEY, trimmed);
    setVolunteerId(trimmed);
  };

  // ── Callsign Setup Screen ────────────────────────────────────────────────────
  if (!volunteerId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem' }}>
        <div style={{ background: '#1e293b', color: '#f8fafc', padding: '3rem 2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '440px', width: '100%' }}>
          <div style={{ background: '#3b82f620', padding: '16px', borderRadius: '50%' }}>
            <UserCircle2 size={40} color="#60a5fa" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 700 }}>Volunteer Identification</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Enter your field callsign before submitting reports. This session ID will be attached to all triage packets.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <input
              id="callsign-input"
              type="text"
              value={callsignInput}
              onChange={e => setCallsignInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSetCallsign()}
              placeholder="e.g. ALPHA-99 or DELTA-07"
              style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', padding: '10px 14px', fontSize: '0.95rem', fontFamily: 'monospace', outline: 'none' }}
              autoFocus
            />
            <button
              onClick={handleSetCallsign}
              style={{ background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Confirm
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Stored in session only — cleared on browser close</p>
        </div>
      </div>
    );
  }

  const handleProcessAndQueue = async (payload: FormReportPayload) => {
    setIsProcessingGemma(true);

    const rawReport: RawFieldReport = {
      id: `rep-${Date.now()}`,
      volunteerId,
      timestamp: Date.now(),
      rawText: payload.rawText,
      sectorId: payload.sectorId,
      coordinates: { lat: 25.7617 + (Math.random() - 0.5) * 0.01, lng: -80.1918 + (Math.random() - 0.5) * 0.01 },
      triageLevel: payload.triageLevel,
      peopleCount: payload.peopleCount,
      criticalFlags: payload.criticalFlags,
    };

    const anonymized = await EdgeGemmaService.processRawReportOnDevice(rawReport);
    setLastProcessedReport(anonymized);
    setOfflineQueue(EdgeGemmaService.getOfflineQueue());
    setIsProcessingGemma(false);
    onQueueChange?.();
  };

  const handleSyncToCloud = () => {
    const queuedReports = offlineQueue.filter((r) => r.syncStatus === 'offline_queued');
    if (queuedReports.length === 0) return;

    queuedReports.forEach((r) => {
      EdgeGemmaService.updateReportStatus(r.id, 'synced');
    });

    setOfflineQueue(EdgeGemmaService.getOfflineQueue());
    onSyncBatchToCloud(queuedReports);
    onQueueChange?.();
  };

  return (
    <div style={{ background: '#1e293b', color: '#f8fafc', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
      {/* Terminal Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#3b82f6', padding: '8px', borderRadius: '8px' }}>
            <Smartphone size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Gemma Edge: Field Volunteer Terminal</h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>On-Device Local Inference (Offline / Zero-Cloud PII) · ID: <strong style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{volunteerId}</strong></span>
          </div>
        </div>

        {/* Network Status Badge (Synchronized with Global Header) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: 800,
            fontSize: '0.78rem',
            fontFamily: 'monospace',
            background:
              networkMode === 'OFFLINE'
                ? '#ef444420'
                : networkMode === 'WEAK_LORA'
                ? '#f59e0b20'
                : networkMode === 'BURST_SATELLITE'
                ? '#0284c720'
                : '#10b98120',
            color:
              networkMode === 'OFFLINE'
                ? '#f87171'
                : networkMode === 'WEAK_LORA'
                ? '#fbbf24'
                : networkMode === 'BURST_SATELLITE'
                ? '#38bdf8'
                : '#34d399',
            border: `1px solid ${
              networkMode === 'OFFLINE'
                ? '#ef444450'
                : networkMode === 'WEAK_LORA'
                ? '#f59e0b50'
                : networkMode === 'BURST_SATELLITE'
                ? '#0284c750'
                : '#10b98150'
            }`,
          }}
        >
          {networkMode === 'OFFLINE' ? (
            <>
              <WifiOff size={14} />
              <span>OFFLINE (LOCAL BUFFER)</span>
            </>
          ) : networkMode === 'WEAK_LORA' ? (
            <>
              <Radio size={14} />
              <span>UPLINK: LORA MESH</span>
            </>
          ) : networkMode === 'BURST_SATELLITE' ? (
            <>
              <Radio size={14} />
              <span>UPLINK: SATELLITE BURST</span>
            </>
          ) : (
            <>
              <Wifi size={14} />
              <span>UPLINK: 4G ONLINE</span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* 1. Report Input Form Component */}
        <ReportInputForm
          onSubmitReport={handleProcessAndQueue}
          isProcessing={isProcessingGemma}
        />

        {/* 2. Scrubbed Report Preview Card Component */}
        {lastProcessedReport && <ScrubbedReportCard report={lastProcessedReport} />}

        {/* 3. Offline Queue Component */}
        <OfflineQueueList
          queue={offlineQueue}
          isOnline={networkMode !== 'OFFLINE'}
          onSync={handleSyncToCloud}
        />
      </div>
    </div>
  );
};

