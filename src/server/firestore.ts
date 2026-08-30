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

export async function getReports(): Promise<AnonymizedReport[]> {
  const firestore = getDb();
  if (!firestore) return [];
  try {
    const snap = await firestore.collection('reports').orderBy('serverReceivedAt', 'desc').limit(100).get();
    return snap.docs.map(d => d.data() as AnonymizedReport);
  } catch (err) {
    console.error('❌ [Firestore] getReports failed:', err);
    return [];
  }
}

export async function getTasks(): Promise<any[]> {
  const firestore = getDb();
  if (!firestore) return [];
  try {
    const snap = await firestore.collection('tasks').orderBy('createdAt', 'desc').limit(50).get();
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error('❌ [Firestore] getTasks failed:', err);
    return [];
  }
}

export async function saveVeoGuide(guide: any): Promise<void> {
  const firestore = getDb();
  if (!firestore) return;
  try {
    await firestore.collection('veo_guides').doc(guide.id).set(guide);
    console.log(`✅ [Firestore] Veo guide ${guide.id} saved`);
  } catch (err) {
    console.error('❌ [Firestore] saveVeoGuide failed:', err);
  }
}

export async function getVeoGuides(): Promise<any[]> {
  const firestore = getDb();
  if (!firestore) return [];
  try {
    const snap = await firestore.collection('veo_guides').orderBy('createdAt', 'desc').limit(20).get();
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error('❌ [Firestore] getVeoGuides failed:', err);
    return [];
  }
}
