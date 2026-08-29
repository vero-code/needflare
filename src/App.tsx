import React, { useState, useEffect } from 'react';
import { CloudLightning } from 'lucide-react';
import { Header, type NetworkMode, type DisplayTheme } from './components/Header';
import { Footer } from './components/Footer';
import { NavigationTabs, type MainTab } from './components/NavigationTabs';
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
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'coordinator' && (
          <CoordinatorDashboard
            sectors={sectors}
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        )}

        {activeTab === 'field' && (
          <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
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
