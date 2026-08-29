import React from 'react';
import { Cpu } from 'lucide-react';

interface ReportInputFormProps {
  sectorId: string;
  onSectorChange: (sector: string) => void;
  rawText: string;
  onRawTextChange: (text: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const ReportInputForm: React.FC<ReportInputFormProps> = ({
  sectorId,
  onSectorChange,
  rawText,
  onRawTextChange,
  onSubmit,
  isProcessing,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
          Disaster Sector:
        </label>
        <select
          value={sectorId}
          onChange={(e) => onSectorChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #334155',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        >
          <option value="sector-alpha">Sector Alpha (Coastal Flooding / Marina)</option>
          <option value="sector-bravo">Sector Bravo (Downtown Emergency Clinic)</option>
          <option value="sector-delta">Sector Delta (North Industrial & Waterworks)</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
          Raw Field Transmission (contains sensitive PII):
        </label>
        <textarea
          rows={3}
          value={rawText}
          onChange={(e) => onRawTextChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #334155',
            resize: 'vertical',
            fontSize: '0.85rem',
            lineHeight: '1.4',
            outline: 'none',
          }}
          placeholder="Type raw field situation with names, phone numbers, and urgent needs..."
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={isProcessing || !rawText.trim()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          borderRadius: '8px',
          background: isProcessing ? '#64748b' : '#3b82f6',
          color: '#fff',
          border: 'none',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: isProcessing || !rawText.trim() ? 'not-allowed' : 'pointer',
          opacity: !rawText.trim() ? 0.6 : 1,
          boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
          transition: 'all 0.15s ease',
        }}
      >
        <Cpu size={18} />
        {isProcessing ? 'Gemma sanitizing & structuring...' : 'Anonymize & Queue on Device (Gemma 3 Edge)'}
      </button>
    </div>
  );
};
