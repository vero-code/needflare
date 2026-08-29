import React, { useState } from 'react';
import { CloudLightning } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { VolunteerEdgeView } from './components/VolunteerEdgeView';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { VeoBroadcastGallery } from './components/VeoBroadcastGallery';
import { CloudGeminiAgent } from './services/cloudGeminiAgent';
import { VeoService } from './services/veoService';
import type { SectorZone, LogisticsTask, VeoVisualGuide, AnonymizedReport } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'field' | 'coordinator' | 'veo'>('coordinator');
  const [sectors, setSectors] = useState<SectorZone[]>(CloudGeminiAgent.initialSectors);
  const [tasks, setTasks] = useState<LogisticsTask[]>(CloudGeminiAgent.initialTasks);
  const [guides, setGuides] = useState<VeoVisualGuide[]>(VeoService.initialGuides);
  const [liveSyncNotice, setLiveSyncNotice] = useState<string | null>(null);

  // Handle synchronization of reports from volunteers to Cloud Agent
  const handleSyncBatchToCloud = async (reports: AnonymizedReport[]) => {
    setLiveSyncNotice(`Google Cloud Pub/Sub: Ingesting ${reports.length} report(s)...`);

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

    setTimeout(() => {
      setLiveSyncNotice(null);
    }, 4500);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

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
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'coordinator' && (
          <CoordinatorDashboard
            sectors={sectors}
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        )}

        {activeTab === 'field' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <VolunteerEdgeView onSyncBatchToCloud={handleSyncBatchToCloud} />
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
    </div>
  );
}

export default App;
