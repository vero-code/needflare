import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { AnonymizedReport } from '../types';

interface ScrubbedReportCardProps {
  report: AnonymizedReport;
}

export const ScrubbedReportCard: React.FC<ScrubbedReportCardProps> = ({ report }) => {
  return (
    <div
      style={{
        background: '#0f172a',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #22c55e',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#22c55e',
          marginBottom: '8px',
          fontWeight: 600,
        }}
      >
        <ShieldCheck size={18} />
        <span>Gemma On-Device: PII successfully scrubbed!</span>
      </div>

      <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', lineHeight: '1.4' }}>
        <strong style={{ color: '#94a3b8' }}>Sanitized Summary:</strong> {report.sanitizedSummary}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
        <span>
          Category: <strong style={{ color: '#38bdf8' }}>{report.category.toUpperCase()}</strong>
        </span>
        <span>
          Headcount: <strong style={{ color: '#f8fafc' }}>{report.estimatedPeopleCount}</strong>
        </span>
        <span>
          Triage Urgency: <strong style={{ color: '#f59e0b' }}>{report.preliminaryUrgency.toUpperCase()}</strong>
        </span>
      </div>

      {report.piiRemoved.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#ef4444' }}>
          <strong>Locally Redacted PII:</strong> {report.piiRemoved.join(', ')}
        </div>
      )}
    </div>
  );
};
