import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { needflareTriageFlow } from './agent/needflareAgent.js';
import { saveReport, saveTask, getFirestoreStatus } from './server/firestore.js';
import { publishReport, getPubSubStatus } from './server/pubsub.js';
import type { AnonymizedReport } from './types/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

// ─── Existing triage endpoint (unchanged) ───────────────────────────────────
app.post('/needflareTriageFlow', async (req, res) => {
  try {
    const { data } = req.body;
    console.log('📡 [NeedFlare Agent] Ingesting report:', data?.sectorId, '| People:', data?.estimatedPeople);

    const result = await needflareTriageFlow(data);
    res.json({ result });
  } catch (error: any) {
    console.error('❌ Error executing needflareTriageFlow:', error);
    res.status(500).json({ error: error?.message || 'Agent error' });
  }
});

// ─── NEW: Batch sync endpoint ─────────────────────────────────────────────────
// Called by the frontend when the user hits "Sync to Cloud"
app.post('/api/reports/batch-sync', async (req, res) => {
  try {
    const { reports } = req.body as { reports: AnonymizedReport[] };
    if (!Array.isArray(reports) || reports.length === 0) {
      return res.status(400).json({ error: 'No reports provided' });
    }

    console.log(`\n🔄 [Batch Sync] Received ${reports.length} report(s) from frontend`);
    const results: { id: string; taskGenerated: boolean; agentReasoning: string }[] = [];

    for (const report of reports) {
      // 1. Persist to Firestore
      await saveReport(report);

      // 2. Publish to Pub/Sub pipeline
      await publishReport(report);

      // 3. Run Gemini 3.7 Flash triage agent
      let agentReasoning = '';
      try {
        const triageResult = await needflareTriageFlow({
          sanitizedReport: report.sanitizedSummary,
          sectorId: report.sectorId,
          estimatedPeople: report.estimatedPeopleCount,
        });
        agentReasoning = triageResult.agentReasoning || '';

        // 4. Persist generated task to Firestore if any
        if (report.preliminaryUrgency === 'critical' || report.preliminaryUrgency === 'high') {
          const generatedTask = {
            id: `task-genkit-${Date.now().toString().slice(-5)}`,
            sectorId: report.sectorId,
            title: `Agent Task: ${report.category.toUpperCase()} — ${report.sectorId}`,
            description: agentReasoning || `Gemini 3.7 triage for ${report.sanitizedSummary.slice(0, 80)}`,
            priority: report.preliminaryUrgency,
            category: report.category,
            requiredPayload: '',
            status: 'pending' as const,
            createdAt: Date.now(),
            aiGenerated: true,
          };
          await saveTask(generatedTask);
        }

        results.push({ id: report.id, taskGenerated: !!agentReasoning, agentReasoning });
      } catch (err) {
        console.warn(`⚠️  Gemini triage failed for ${report.id}:`, err);
        results.push({ id: report.id, taskGenerated: false, agentReasoning: '' });
      }
    }

    console.log(`✅ [Batch Sync] Done — ${results.length} reports processed`);
    res.json({ synced: results.length, results });
  } catch (error: any) {
    console.error('❌ [Batch Sync] Error:', error);
    res.status(500).json({ error: error?.message || 'Sync error' });
  }
});

// ─── NEW: Agent status endpoint ───────────────────────────────────────────────
app.get('/api/agent/status', async (_, res) => {
  const [firestoreStatus, pubsubStatus] = await Promise.allSettled([
    getFirestoreStatus(),
    getPubSubStatus(),
  ]);

  res.json({
    status: 'ok',
    agent: 'NeedFlare Gemini 3.7 Flash Agent',
    model: 'gemini-3.7-flash',
    framework: 'GenKit v1.41',
    port: PORT,
    infrastructure: {
      firestore: firestoreStatus.status === 'fulfilled' ? firestoreStatus.value : { connected: false },
      pubsub: pubsubStatus.status === 'fulfilled' ? pubsubStatus.value : { connected: false },
    },
    geminiApiKey: process.env.GEMINI_API_KEY ? '✅ set' : '❌ missing',
    googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT || null,
    timestamp: new Date().toISOString(),
  });
});

// ─── Health check (unchanged) ────────────────────────────────────────────────
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    agent: 'NeedFlare Gemini 3.7 Flash Agent',
    model: 'gemini-3.7-flash',
    framework: 'GenKit + Google Cloud Run',
    port: PORT,
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 NeedFlare Genkit Agent Server running on http://localhost:${PORT}`);
  console.log(`🧠 Agent Model: Gemini 3.7 Flash with multi-tool execution`);
  console.log(`📦 Google Cloud Project: ${process.env.GOOGLE_CLOUD_PROJECT || 'NOT SET (local mode)'}`);
  console.log(`📡 Pub/Sub Topic: needflare-reports`);
  console.log(`🗄️  Firestore: ${process.env.GOOGLE_CLOUD_PROJECT ? 'enabled' : 'disabled (local)'}\n`);
});
