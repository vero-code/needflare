import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Smartphone } from 'lucide-react';
import { EdgeGemmaService } from '../services/edgeGemmaService';
import { ReportInputForm, type FormReportPayload } from './ReportInputForm';
import { ScrubbedReportCard } from './ScrubbedReportCard';
import { OfflineQueueList } from './OfflineQueueList';
import type { RawFieldReport, AnonymizedReport } from '../types';

interface VolunteerEdgeViewProps {
  onSyncBatchToCloud: (reports: AnonymizedReport[]) => void;
  onQueueChange?: () => void;
}

export const VolunteerEdgeView: React.FC<VolunteerEdgeViewProps> = ({ onSyncBatchToCloud, onQueueChange }) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [volunteerId] = useState<string>('VOLUNTEER-77-ALPHA');
  const [isProcessingGemma, setIsProcessingGemma] = useState<boolean>(false);
  const [lastProcessedReport, setLastProcessedReport] = useState<AnonymizedReport | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<AnonymizedReport[]>([]);

  useEffect(() => {
    setOfflineQueue(EdgeGemmaService.getOfflineQueue());
  }, []);

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
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>On-Device Local Inference (Offline / Zero-Cloud PII)</span>
          </div>
        </div>

        {/* Network Toggle Button */}
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
            transition: 'all 0.15s ease',
          }}
        >
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? 'Network: 4G Online' : 'Network: Offline'}
        </button>
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
          isOnline={isOnline}
          onSync={handleSyncToCloud}
        />
      </div>
    </div>
  );
};

