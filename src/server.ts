import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { needflareTriageFlow } from './agent/needflareAgent';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/needflareTriageFlow', async (req, res) => {
  try {
    const { data } = req.body;
    console.log('📡 [NeedFlare Agent] Ingesting report:', data);

    const result = await needflareTriageFlow(data);
    res.json({ result });
  } catch (error: any) {
    console.error('❌ Error executing needflareTriageFlow:', error);
    res.status(500).json({ error: error?.message || 'Agent error' });
  }
});

app.get('/health', (_, res) => {
  res.json({ status: 'ok', agent: 'NeedFlare Gemini 3.7 Flash Agent', port: PORT });
});

app.listen(PORT, () => {
  console.log(`🚀 NeedFlare Genkit Agent Server running on http://localhost:${PORT}`);
  console.log(`🧠 Agent Model: Gemini 3.7 Flash with multi-tool execution`);
});
