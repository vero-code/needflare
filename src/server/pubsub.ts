import { PubSub } from '@google-cloud/pubsub';
import type { AnonymizedReport } from '../types/index.js';

const TOPIC_NAME = 'needflare-reports';

let pubsub: PubSub | null = null;

function getClient(): PubSub | null {
  if (!process.env.GOOGLE_CLOUD_PROJECT) return null;
  if (!pubsub) {
    pubsub = new PubSub({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
  }
  return pubsub;
}

export async function publishReport(report: AnonymizedReport): Promise<string | null> {
  const client = getClient();
  if (!client) {
    console.log('⚠️  Pub/Sub: GOOGLE_CLOUD_PROJECT not set — skipping publish');
    return null;
  }
  try {
    const topic = client.topic(TOPIC_NAME);
    const messageId = await topic.publishMessage({
      json: report,
      attributes: {
        sectorId: report.sectorId,
        urgency: report.preliminaryUrgency,
        category: report.category,
      },
    });
    console.log(`📡 [Pub/Sub] Published report ${report.id} → message ${messageId}`);
    return messageId;
  } catch (err) {
    console.error('❌ [Pub/Sub] publishReport failed:', err);
    return null;
  }
}

export async function getPubSubStatus(): Promise<{ connected: boolean; topic: string; project: string | undefined }> {
  const client = getClient();
  if (!client) return { connected: false, topic: TOPIC_NAME, project: undefined };
  try {
    const [exists] = await client.topic(TOPIC_NAME).exists();
    return { connected: exists, topic: TOPIC_NAME, project: process.env.GOOGLE_CLOUD_PROJECT };
  } catch {
    return { connected: false, topic: TOPIC_NAME, project: process.env.GOOGLE_CLOUD_PROJECT };
  }
}
