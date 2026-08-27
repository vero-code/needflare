import React, { useState } from 'react';
import { Flame, Smartphone, LayoutDashboard, Video, CloudLightning, Shield } from 'lucide-react';
import { VolunteerEdgeView } from './components/VolunteerEdgeView';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { VeoBroadcastGallery } from './components/VeoBroadcastGallery';
import { CloudGeminiAgent } from './services/cloudGeminiAgent';
import { VeoService } from './services/veoService';
import { SectorZone, LogisticsTask, VeoVisualGuide, AnonymizedReport } from './types';

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
      {/* Top Navbar */}
      <header
        style={{
          background: '#0f172a',
          borderBottom: '1px solid #1e293b',
          padding: '0.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
            <Flame size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              NeedFlare
            </div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>
              Gemma Edge • Gemini 3.5 Flash • Google Veo
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: '#1e293b', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('coordinator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'coordinator' ? '#3b82f6' : 'transparent',
              color: activeTab === 'coordinator' ? '#fff' : '#94a3b8',
            }}
          >
            <LayoutDashboard size={16} />
            Coordinator Map & Triage
          </button>

          <button
            onClick={() => setActiveTab('field')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'field' ? '#3b82f6' : 'transparent',
              color: activeTab === 'field' ? '#fff' : '#94a3b8',
            }}
          >
            <Smartphone size={16} />
            Volunteer Field Edge (Gemma)
          </button>

          <button
            onClick={() => setActiveTab('veo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'veo' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'veo' ? '#fff' : '#94a3b8',
            }}
          >
            <Video size={16} />
            Veo Visual Guides
          </button>
        </div>
      </header>

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
      <footer style={{ background: '#0f172a', borderTop: '1px solid #1e293b', padding: '1rem 2rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        NeedFlare System Architecture: Gemma (Offline Edge PII Anonymizer) ➔ Google Cloud Pub/Sub ➔ Gemini 3.5 Flash (Triage & Logistics) ➔ Google Veo (Universal Visual Survival Instructions)
      </footer>
    </div>
  );
}

export default App;
