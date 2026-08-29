import React from 'react';
import { Radio, Zap, Truck, ShieldAlert } from 'lucide-react';
import type { AnonymizedReport, LogisticsTask } from '../types';

interface IncidentEventStreamProps {
  reports: AnonymizedReport[];
  tasks: LogisticsTask[];
}

export const IncidentEventStream: React.FC<IncidentEventStreamProps> = ({ reports, tasks }) => {
  // Build unified event list from real reports + real tasks, most recent first
  type Event = {
    key: string;
    timestamp: number;
    type: 'report' | 'task';
    label: string;
    sectorTag: string;
    sectorColor: string;
    tagBg: string;
    description: string;
    rightLabel: string;
    rightColor: string;
  };

  const reportEvents: Event[] = reports.slice(-4).reverse().map((r) => ({
    key: r.id,
    timestamp: r.timestamp,
    type: 'report',
    label: r.sectorId.replace('sector-', 'Sector ').toUpperCase(),
    sectorTag: r.sectorId.replace('sector-', 'Sector ').toUpperCase(),
    sectorColor: r.preliminaryUrgency === 'critical' ? '#ef4444' : r.preliminaryUrgency === 'high' ? '#f97316' : '#fbbf24',
    tagBg: r.preliminaryUrgency === 'critical' ? '#ef444420' : r.preliminaryUrgency === 'high' ? '#f9731620' : '#fbbf2420',
    description: `Gemma scrubbed ${r.piiRemoved?.length ?? 0} PII field(s) ➔ Gemini 3.7 evaluated: <strong>${r.preliminaryUrgency?.toUpperCase()}</strong> ➔ Task auto-dispatched`,
    rightLabel: `${r.category?.toUpperCase()} · ${r.estimatedPeopleCount ?? 1} PERS.`,
    rightColor: '#38bdf8',
  }));

  const taskEvents: Event[] = tasks
    .filter((t) => (t as any).aiGenerated)
    .slice(-2)
    .reverse()
    .map((t) => ({
      key: t.id,
      timestamp: t.createdAt,
      type: 'task',
      label: 'GEMINI TASK',
      sectorTag: 'GEMINI TASK',
      sectorColor: '#a78bfa',
      tagBg: '#8b5cf620',
      description: t.title,
      rightLabel: `Status: ${t.status?.replace('_', ' ').toUpperCase()}`,
      rightColor: t.status === 'delivered' ? '#34d399' : t.status === 'in_route' ? '#38bdf8' : '#fbbf24',
    }));

  // Merge and sort by timestamp descending, show latest 5
  const allEvents = [...reportEvents, ...taskEvents]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  const formatTime = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return 'JUST NOW';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #33415550',
          paddingBottom: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
          <Radio size={16} color="#10b981" />
          Live Incident Event Stream (Gemma Edge ➔ Pub/Sub ➔ Gemini 3.7)
        </div>
        <span style={{ fontSize: '0.75rem', color: reports.length > 0 ? '#34d399' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: reports.length > 0 ? '#34d399' : '#64748b', display: 'inline-block' }}></span>
          {reports.length > 0 ? `${reports.length} Report(s) in Pipeline` : 'Awaiting Reports'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {allEvents.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.82rem', padding: '1.5rem 0' }}>
            <ShieldAlert size={20} style={{ marginBottom: '6px', opacity: 0.5 }} />
            <div>No events yet — submit a field report to see real-time activity</div>
          </div>
        ) : (
          allEvents.map((event) => (
            <div
              key={event.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0f172a',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                border: '1px solid #334155',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                  {formatTime(event.timestamp)}
                </span>
                <span
                  style={{
                    background: event.tagBg,
                    color: event.sectorColor,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {event.sectorTag}
                </span>
                <span
                  style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
              <span style={{ color: event.rightColor, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '8px' }}>
                {event.rightLabel}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
