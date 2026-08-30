import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { needflareTriageFlow } from './agent/needflareAgent.js';
import { saveReport, saveTask, getFirestoreStatus, getReports, getTasks, saveVeoGuide, getVeoGuides } from './server/firestore.js';
import { publishReport, getPubSubStatus } from './server/pubsub.js';
import type { AnonymizedReport } from './types/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));
app.use('/videos', express.static(path.resolve('public/videos')));

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

        // 4. Persist generated task to Firestore
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

// ─── GET: List reports from Firestore ────────────────────────────────────────
app.get('/api/reports', async (_, res) => {
  try {
    const reports = await getReports();
    res.json({ reports, total: reports.length });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch reports' });
  }
});

// ─── GET: List tasks from Firestore ──────────────────────────────────────────
app.get('/api/tasks', async (_, res) => {
  try {
    const tasks = await getTasks();
    res.json({ tasks, total: tasks.length });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch tasks' });
  }
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

// ─── GET: List Veo guides from Firestore ─────────────────────────────────────
app.get('/api/veo/guides', async (_, res) => {
  try {
    const guides = await getVeoGuides();
    res.json({ guides, total: guides.length });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch Veo guides' });
  }
});

// ─── Helper: Poll Google Veo in background & download MP4 ───────────────────
function pollAndDownloadVeo(operationName: string, guideData: any, apiKey: string) {
  const pollInterval = setInterval(() => {
    https.get(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', async () => {
        try {
          const op = JSON.parse(data);
          if (op.done) {
            clearInterval(pollInterval);
            console.log(`✨ [Google Veo 3.1] Generation complete for ${guideData.id}!`);
            const videoUri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
            if (videoUri) {
              const videoDir = path.resolve('public/videos');
              if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
              const filename = `${guideData.id}.mp4`;
              const dest = path.join(videoDir, filename);

              const file = fs.createWriteStream(dest);
              https.get(`${videoUri}&alt=media&key=${apiKey}`, (downloadRes) => {
                downloadRes.pipe(file);
                file.on('finish', async () => {
                  file.close();
                  console.log(`📥 [Google Veo 3.1] Video saved to ${dest}`);
                  // Update Firestore record with ready status and real video URL!
                  await saveVeoGuide({
                    ...guideData,
                    videoUrl: `/videos/${filename}`,
                    status: 'ready',
                    updatedAt: Date.now(),
                  });
                });
              });
            }
          }
        } catch (err) {
          console.error('Veo polling parse error:', err);
        }
      });
    }).on('error', (e) => console.error('Veo poll error:', e));
  }, 6000);
}

// ─── POST: Trigger Google Veo 3.1 generation ─────────────────────────────────
app.post('/api/veo/generate', async (req, res) => {
  try {
    const { category, prompt } = req.body;
    const effectiveCategory = category || 'water';
    const effectivePrompt = prompt || `Universal step-by-step non-verbal survival guide for ${effectiveCategory}, 4K.`;
    const guideId = `veo-${effectiveCategory}-${Date.now().toString().slice(-4)}`;

    const newGuide = {
      id: guideId,
      title: `Emergency Protocol: ${effectiveCategory.toUpperCase()}`,
      targetCrisis: effectiveCategory,
      generatedPrompt: effectivePrompt,
      thumbnailUrl: '',
      videoUrl: '',
      keyVisualSteps: [
        `1. Execute standard ${effectiveCategory} safety protocol`,
        '2. Step-by-step universal non-verbal action',
        '3. Signal nearby teams using reflective marker',
      ],
      isBroadcasting: true,
      status: 'generating',
      createdAt: Date.now(),
    };

    // Save initial record in Firestore
    await saveVeoGuide(newGuide);

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const postData = JSON.stringify({
      instances: [{ prompt: effectivePrompt }],
      parameters: { aspectRatio: '16:9' },
    });

    const veoReq = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (veoRes) => {
      let data = '';
      veoRes.on('data', (c) => (data += c));
      veoRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const opName = parsed.name;
          if (opName) {
            console.log(`🎬 [Google Veo 3.1 Fast] Operation started: ${opName}`);
            pollAndDownloadVeo(opName, newGuide, apiKey!);
          } else {
            console.error('Veo returned unexpected response:', parsed);
          }
        } catch (e) {
          console.error('Veo start parse error:', e);
        }
      });
    });

    veoReq.on('error', (e) => console.error('Veo request error:', e));
    veoReq.write(postData);
    veoReq.end();

    res.json({ guide: newGuide, status: 'generating' });
  } catch (error: any) {
    console.error('Veo generate error:', error);
    res.status(500).json({ error: error?.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 NeedFlare Genkit Agent Server running on http://localhost:${PORT}`);
  console.log(`🧠 Agent Model: Gemini 3.7 Flash with multi-tool execution`);
  console.log(`📦 Google Cloud Project: ${process.env.GOOGLE_CLOUD_PROJECT || 'NOT SET (local mode)'}`);
  console.log(`📡 Pub/Sub Topic: needflare-reports`);
  console.log(`🗄️  Firestore: ${process.env.GOOGLE_CLOUD_PROJECT ? 'enabled' : 'disabled (local)'}\n`);
});
