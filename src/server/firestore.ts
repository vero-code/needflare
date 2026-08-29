import { Firestore } from '@google-cloud/firestore';
import type { AnonymizedReport, LogisticsTask } from '../types/index.js';

let db: Firestore | null = null;

function getDb(): Firestore | null {
  if (!process.env.GOOGLE_CLOUD_PROJECT) return null;
  if (!db) {
    db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      databaseId: process.env.FIRESTORE_DATABASE_ID || 'needflare-db',
    });
  }
  return db;
}

export async function saveReport(report: AnonymizedReport): Promise<void> {
  const firestore = getDb();
  if (!firestore) {
    console.log('⚠️  Firestore: GOOGLE_CLOUD_PROJECT not set — skipping persist');
    return;
  }
  try {
    await firestore.collection('reports').doc(report.id).set({
      ...report,
      serverReceivedAt: Date.now(),
    });
    console.log(`✅ [Firestore] Report ${report.id} saved`);
  } catch (err) {
    console.error('❌ [Firestore] saveReport failed:', err);
  }
}

export async function saveTask(task: LogisticsTask): Promise<void> {
  const firestore = getDb();
  if (!firestore) return;
  try {
    await firestore.collection('tasks').doc(task.id).set(task);
    console.log(`✅ [Firestore] Task ${task.id} saved`);
  } catch (err) {
    console.error('❌ [Firestore] saveTask failed:', err);
  }
}

export async function getFirestoreStatus(): Promise<{ connected: boolean; project: string | undefined }> {
  const firestore = getDb();
  if (!firestore) return { connected: false, project: undefined };
  try {
    await firestore.collection('_health').doc('ping').set({ ts: Date.now() });
    return { connected: true, project: process.env.GOOGLE_CLOUD_PROJECT };
  } catch {
    return { connected: false, project: process.env.GOOGLE_CLOUD_PROJECT };
  }
}
