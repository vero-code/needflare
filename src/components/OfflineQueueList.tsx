import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { AnonymizedReport } from '../types';

interface OfflineQueueListProps {
  queue: AnonymizedReport[];
  isOnline: boolean;
  onSync: () => void;
}

export const OfflineQueueList: React.FC<OfflineQueueListProps> = ({
  queue,
  isOnline,
  onSync,
}) => {
  const pendingReports = queue.filter((r) => r.syncStatus === 'offline_queued');

  return (
    <div
      style={{
        background: '#0f172a',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '0.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          On-Device Offline Queue ({queue.length} reports)
        </span>
        <button
          onClick={onSync}
          disabled={!isOnline || pendingReports.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: isOnline && pendingReports.length > 0 ? '#10b981' : '#334155',
            color: '#fff',
            border: 'none',
            cursor: isOnline && pendingReports.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '0.8rem',
            fontWeight: 600,
            opacity: !isOnline || pendingReports.length === 0 ? 0.5 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          <RefreshCw size={14} />
          Sync to Google Cloud (Pub/Sub)
        </button>
      </div>

      <div
        style={{
          maxHeight: '140px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {queue.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '12px' }}>
            No reports in local queue.
          </div>
        ) : (
          queue.map((rep) => (
            <div
              key={rep.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#1e293b',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '0.8rem',
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '70%',
                  color: '#e2e8f0',
                }}
              >
                [{rep.category.toUpperCase()}] {rep.sanitizedSummary}
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  background: rep.syncStatus === 'synced' ? '#065f46' : '#9a3412',
                  color: rep.syncStatus === 'synced' ? '#6ee7b7' : '#fdba74',
                }}
              >
                {rep.syncStatus === 'synced' ? 'Synced' : 'Offline Queued'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
