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
import { OfflineSyncQueue } from './components/OfflineSyncQueue';
import { CloudGeminiAgent } from './services/cloudGeminiAgent';
import { VeoService } from './services/veoService';
import { EdgeGemmaService } from './services/edgeGemmaService';
import type { SectorZone, LogisticsTask, VeoVisualGuide, AnonymizedReport } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('field');
  const [networkMode, setNetworkMode] = useState<NetworkMode>('ONLINE_4G');
  const [displayTheme, setDisplayTheme] = useState<DisplayTheme>('AMOLED_TACTICAL');
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [offlineReports, setOfflineReports] = useState<AnonymizedReport[]>([]);
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
    setOfflineReports(queue);
  };

  useEffect(() => {
    refreshPendingCount();
  }, []);

  const [serverReports, setServerReports] = useState<AnonymizedReport[]>([]);

  // Load tasks and reports from Firestore via Cloud Run on startup
  useEffect(() => {
    const AGENT_URL = (import.meta as any).env?.VITE_AGENT_URL || 'http://localhost:8080';
    
    // Fetch tasks
    fetch(`${AGENT_URL}/api/tasks`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          // Merge: Firestore AI tasks first, then mock tasks (no duplicates)
          const mockIds = new Set(CloudGeminiAgent.initialTasks.map((t: LogisticsTask) => t.id));
          const firestoreTasks = data.tasks.filter((t: LogisticsTask) => !mockIds.has(t.id));
          setTasks([...firestoreTasks, ...CloudGeminiAgent.initialTasks]);
          console.log(`✅ Loaded ${firestoreTasks.length} task(s) from Firestore`);
        }
      })
      .catch(() => console.warn('⚠️ Could not load tasks from Cloud Run — using defaults'));

    // Fetch reports
    fetch(`${AGENT_URL}/api/reports`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.reports) && data.reports.length > 0) {
          setServerReports(data.reports);
          console.log(`✅ Loaded ${data.reports.length} report(s) from Firestore`);
        }
      })
      .catch(() => console.warn('⚠️ Could not load reports from Cloud Run — using local queue'));
  }, []);

  // Merge server reports + local offline queue reports (deduplicate by id)
  const allReports = React.useMemo(() => {
    const map = new Map<string, AnonymizedReport>();
    serverReports.forEach(r => map.set(r.id, r));
    offlineReports.forEach(r => map.set(r.id, r));
    return Array.from(map.values());
  }, [serverReports, offlineReports]);

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
        const enhancedTask = { ...triageResult.generatedTask, aiGenerated: true };
        setTasks((prev) => [enhancedTask, ...prev]);
      }

      if (triageResult.triggeredVeoPrompt) {
        setLiveSyncNotice(`Gemini Flash triggered automatic Veo Visual Guide for [${report.category.toUpperCase()}]`);
      }
    }

    // Forward batch to Cloud Run server for Firestore and Pub/Sub persistence
    const AGENT_URL = (import.meta as any).env?.VITE_AGENT_URL || 'http://localhost:8080';
    try {
      await fetch(`${AGENT_URL}/api/reports/batch-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports }),
      });
      console.log('✅ Batch successfully synced to Cloud Run / Firestore / PubSub');
    } catch (e) {
      console.warn('⚠️ Cloud Run batch sync endpoint offline or unreachable:', e);
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
        activeIncidentsCount={sectors.filter(s => s.emergencyLevel !== 'low' && s.totalReportsCount > 0).length}
        criticalT1Count={sectors.filter(s => s.emergencyLevel === 'critical').reduce((sum, s) => sum + s.totalReportsCount, 0)}
        logisticsConvoysCount={tasks.length}
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
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingQueueCount={pendingQueueCount}
        />

        {activeTab === 'coordinator' && (
          <CoordinatorDashboard
            sectors={sectors}
            tasks={tasks}
            reports={allReports}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        )}

        {activeTab === 'field' && (
          <VolunteerEdgeView
            networkMode={networkMode}
            onSyncBatchToCloud={handleSyncBatchToCloud}
            onQueueChange={refreshPendingCount}
          />
        )}

        {activeTab === 'buffer' && (
          <OfflineSyncQueue
            reports={offlineReports}
            networkMode={networkMode}
            isSyncing={isSyncing}
            onTriggerSync={handleTriggerSync}
            onRefreshReports={refreshPendingCount}
          />
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
