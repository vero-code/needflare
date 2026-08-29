import React, { useState, useEffect } from 'react';
import { ShieldCheck, Wifi, WifiOff, Cpu, RefreshCw, Smartphone } from 'lucide-react';
import { EdgeGemmaService } from '../services/edgeGemmaService';
import type { RawFieldReport, AnonymizedReport } from '../types';

interface VolunteerEdgeViewProps {
  onSyncBatchToCloud: (reports: AnonymizedReport[]) => void;
  onQueueChange?: () => void;
}

export const VolunteerEdgeView: React.FC<VolunteerEdgeViewProps> = ({ onSyncBatchToCloud, onQueueChange }) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [volunteerId] = useState<string>('VOLUNTEER-77-ALPHA');
  const [sectorId, setSectorId] = useState<string>('sector-alpha');
  const [rawText, setRawText] = useState<string>(
    'Citizen Johnathan Miller, phone: +1-555-019-2834, 442 River St. Basement flooded, 6 people trapped including 2 toddlers, urgently need clean drinking water and purification tablets.'
  );
  const [isProcessingGemma, setIsProcessingGemma] = useState<boolean>(false);
  const [lastProcessedReport, setLastProcessedReport] = useState<AnonymizedReport | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<AnonymizedReport[]>([]);

  useEffect(() => {
    setOfflineQueue(EdgeGemmaService.getOfflineQueue());
  }, []);

  const handleProcessAndQueue = async () => {
    if (!rawText.trim()) return;
    setIsProcessingGemma(true);

    const rawReport: RawFieldReport = {
      id: `rep-${Date.now()}`,
      volunteerId,
      timestamp: Date.now(),
      rawText,
      sectorId,
      coordinates: { lat: 25.7617 + (Math.random() - 0.5) * 0.01, lng: -80.1918 + (Math.random() - 0.5) * 0.01 },
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

    // Simulate Google Cloud Pub/Sub publish
    queuedReports.forEach((r) => {
      EdgeGemmaService.updateReportStatus(r.id, 'synced');
    });

    setOfflineQueue(EdgeGemmaService.getOfflineQueue());
    onSyncBatchToCloud(queuedReports);
    onQueueChange?.();
  };

  return (
    <div style={{ background: '#1e293b', color: '#f8fafc', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#3b82f6', padding: '8px', borderRadius: '8px' }}>
            <Smartphone size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Gemma Edge: Field Volunteer Terminal</h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>On-Device Local Inference (Offline / Zero-Cloud PII)</span>
          </div>
        </div>

        {/* Network Toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            background: isOnline ? '#10b981' : '#64748b',
            color: '#ffffff',
          }}
        >
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? 'Network: 4G Online' : 'Network: Offline'}
        </button>
      </div>

      {/* Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Disaster Sector:
          </label>
          <select
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
          >
            <option value="sector-alpha">Sector Alpha (Coastal Area)</option>
            <option value="sector-bravo">Sector Bravo (Downtown District)</option>
            <option value="sector-delta">Sector Delta (North Industrial)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
            Raw Field Transmission (contains sensitive PII):
          </label>
          <textarea
            rows={3}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', resize: 'vertical' }}
            placeholder="Type raw field situation with names, phone numbers, and urgent needs..."
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleProcessAndQueue}
          disabled={isProcessingGemma}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '8px',
            background: isProcessingGemma ? '#64748b' : '#3b82f6',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: isProcessingGemma ? 'not-allowed' : 'pointer',
          }}
        >
          <Cpu size={18} />
          {isProcessingGemma ? 'Gemma sanitizing & structuring...' : 'Anonymize & Queue on Device (Gemma 3 Edge)'}
        </button>

        {/* Processed Report Preview */}
        {lastProcessedReport && (
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #22c55e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', marginBottom: '8px', fontWeight: 600 }}>
              <ShieldCheck size={18} />
              Gemma On-Device: PII successfully scrubbed!
            </div>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem' }}>
              <strong>Sanitized Summary:</strong> {lastProcessedReport.sanitizedSummary}
            </p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span>Category: <strong style={{ color: '#38bdf8' }}>{lastProcessedReport.category.toUpperCase()}</strong></span>
              <span>Headcount: <strong>{lastProcessedReport.estimatedPeopleCount}</strong></span>
              <span>Triage Urgency: <strong style={{ color: '#f59e0b' }}>{lastProcessedReport.preliminaryUrgency.toUpperCase()}</strong></span>
            </div>
            {lastProcessedReport.piiRemoved.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#ef4444' }}>
                Locally Redacted PII: {lastProcessedReport.piiRemoved.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Offline Queue Bar */}
        <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              On-Device Offline Queue ({offlineQueue.length} reports)
            </span>
            <button
              onClick={handleSyncToCloud}
              disabled={!isOnline || offlineQueue.filter((r) => r.syncStatus === 'offline_queued').length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: isOnline && offlineQueue.some((r) => r.syncStatus === 'offline_queued') ? '#10b981' : '#334155',
                color: '#fff',
                border: 'none',
                cursor: isOnline ? 'pointer' : 'not-allowed',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={14} />
              Sync to Google Cloud (Pub/Sub)
            </button>
          </div>

          <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {offlineQueue.map((rep) => (
              <div
                key={rep.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#1e293b',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  [{rep.category.toUpperCase()}] {rep.sanitizedSummary}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    background: rep.syncStatus === 'synced' ? '#065f46' : '#9a3412',
                    color: rep.syncStatus === 'synced' ? '#6ee7b7' : '#fdba74',
                  }}
                >
                  {rep.syncStatus === 'synced' ? 'Synced' : 'Offline Queued'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
