import React, { useState, useEffect } from 'react';
import { CloudLightning, LayoutDashboard, Smartphone, Video } from 'lucide-react';
import { Header, type NetworkMode, type DisplayTheme } from './components/Header';
import { Footer } from './components/Footer';
import { PiiInspectorModal } from './components/PiiInspectorModal';
import { AiFieldCopilotModal } from './components/AiFieldCopilotModal';
import { VolunteerEdgeView } from './components/VolunteerEdgeView';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { VeoBroadcastGallery } from './components/VeoBroadcastGallery';
import { CloudGeminiAgent } from './services/cloudGeminiAgent';
import { VeoService } from './services/veoService';
import { EdgeGemmaService } from './services/edgeGemmaService';
import type { SectorZone, LogisticsTask, VeoVisualGuide, AnonymizedReport } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'field' | 'coordinator' | 'veo'>('coordinator');
  const [networkMode, setNetworkMode] = useState<NetworkMode>('ONLINE_4G');
  const [displayTheme, setDisplayTheme] = useState<DisplayTheme>('AMOLED_TACTICAL');
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isPiiInspectorOpen, setIsPiiInspectorOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [sectors, setSectors] = useState<SectorZone[]>(CloudGeminiAgent.initialSectors);
  const [tasks, setTasks] = useState<LogisticsTask[]>(CloudGeminiAgent.initialTasks);
  const [guides, setGuides] = useState<VeoVisualGuide[]>(VeoService.initialGuides);
  const [liveSyncNotice, setLiveSyncNotice] = useState<string | null>(null);

  const refreshPendingCount = () => {
    const queue = EdgeGemmaService.getOfflineQueue();
    const count = queue.filter((r) => r.syncStatus === 'offline_queued').length;
    setPendingQueueCount(count);
  };

  useEffect(() => {
    refreshPendingCount();
  }, []);

  // Handle synchronization of reports from volunteers to Cloud Agent
  const handleSyncBatchToCloud = async (reports: AnonymizedReport[]) => {
    const modeLabel =
      networkMode === 'WEAK_LORA'
        ? 'LoRa Mesh Packet Radio'
        : networkMode === 'BURST_SATELLITE'
        ? 'Orbital Satellite Uplink'
        : 'Google Cloud Pub/Sub Pipeline';

    setLiveSyncNotice(`${modeLabel}: Ingesting ${reports.length} report(s)...`);

    for (const report of reports) {
      const triageResult = await CloudGeminiAgent.processCloudTriage(report, sectors, tasks);
      setSectors(triageResult.updatedSectors);

      if (triageResult.generatedTask) {
        setTasks((prev) => [triageResult.generatedTask!, ...prev]);
      }

      if (triageResult.triggeredVeoPrompt) {
        setLiveSyncNotice(`Gemini Flash triggered automatic Veo Visual Guide for [${report.category.toUpperCase()}]`);
      }
    }

    refreshPendingCount();
    setTimeout(() => {
      setLiveSyncNotice(null);
    }, 4500);
  };

  const handleTriggerSync = async () => {
    if (networkMode === 'OFFLINE' || isSyncing) return;
    const queue = EdgeGemmaService.getOfflineQueue();
    const pending = queue.filter((r) => r.syncStatus === 'offline_queued');
    if (pending.length === 0) return;

    setIsSyncing(true);
    pending.forEach((r) => EdgeGemmaService.updateReportStatus(r.id, 'synced'));
    await handleSyncBatchToCloud(pending);
    refreshPendingCount();
    setIsSyncing(false);
  };

  const handleUpdateTaskStatus = (taskId: string, status: LogisticsTask['status']) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  const handleAddVeoGuide = (newGuide: VeoVisualGuide) => {
    setGuides((prev) => [newGuide, ...prev]);
  };

  const handleToggleBroadcast = (id: string) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isBroadcasting: !g.isBroadcasting } : g))
    );
  };

  return (
    <div
      className={`app-root theme-${displayTheme.toLowerCase()}`}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Header
        networkMode={networkMode}
        onNetworkModeChange={setNetworkMode}
        pendingQueueCount={pendingQueueCount}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerSync}
        onOpenPiiInspector={() => setIsPiiInspectorOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        displayTheme={displayTheme}
        onThemeChange={setDisplayTheme}
      />

      {/* Cloud Pub/Sub Notification Toast */}
      {liveSyncNotice && (
        <div
          style={{
            background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)',
            color: '#fff',
            padding: '10px 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
          }}
        >
          <CloudLightning size={18} />
          {liveSyncNotice}
        </div>
      )}

      {/* Main Container */}
      <main style={{ flex: 1, padding: '1.5rem 2rem 2rem 2rem', maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Primary Navigation Tabs */}
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
              onClick={() => setActiveTab('coordinator')}
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
              onClick={() => setActiveTab('field')}
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
              onClick={() => setActiveTab('veo')}
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
            Mode: <span style={{ color: '#38bdf8' }}>{activeTab === 'coordinator' ? 'HQ Coordination' : activeTab === 'field' ? 'Field Terminal (Offline Ready)' : 'Universal Broadcast'}</span>
          </div>
        </div>
        {activeTab === 'coordinator' && (
          <CoordinatorDashboard
            sectors={sectors}
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        )}

        {activeTab === 'field' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <VolunteerEdgeView
              onSyncBatchToCloud={handleSyncBatchToCloud}
              onQueueChange={refreshPendingCount}
            />
          </div>
        )}

        {activeTab === 'veo' && (
          <VeoBroadcastGallery
            guides={guides}
            onAddGuide={handleAddVeoGuide}
            onToggleBroadcast={handleToggleBroadcast}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mission-Critical Modals */}
      <PiiInspectorModal
        isOpen={isPiiInspectorOpen}
        onClose={() => setIsPiiInspectorOpen(false)}
      />

      <AiFieldCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
}

export default App;
