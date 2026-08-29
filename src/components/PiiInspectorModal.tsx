import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, X, EyeOff } from 'lucide-react';

interface PiiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PiiInspectorModal: React.FC<PiiInspectorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: '#1e293b',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#10b98120', padding: '8px', borderRadius: '8px' }}>
              <ShieldCheck size={22} color="#34d399" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                On-Device PII Sanitization Protocol
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Gemma 3 Edge Engine · Zero-Leakage Architecture
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Guarantee Banner */}
          <div
            style={{
              background: '#064e3b30',
              border: '1px solid #05966960',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              gap: '12px',
            }}
          >
            <Lock size={22} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>
                Client-Side Privacy Guarantee
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45' }}>
                Under disaster conditions, vulnerable victims may face harassment or looting if exact home addresses and names are intercepted. NeedFlare executes Gemma 3 locally on-device to scrub all Personally Identifiable Information (PII) before any network broadcast.
              </p>
            </div>
          </div>

          {/* Redaction Rules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Edge Privacy Rules Active:
            </div>

            <div style={{ background: '#1e293b', padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>1. Full Names & Identities</span>
                <span style={{ fontSize: '0.7rem', background: '#ef444420', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>REDACTED</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Any person’s name is converted to <code style={{ color: '#fbbf24' }}>[REDACTED_NAME]</code> on the mobile device.
              </span>
            </div>

            <div style={{ background: '#1e293b', padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>2. Phone Numbers & Messenger Contacts</span>
                <span style={{ fontSize: '0.7rem', background: '#ef444420', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>REDACTED</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Telephone strings in standard, E.164, and local formats are scrubbed to <code style={{ color: '#fbbf24' }}>[REDACTED_PHONE]</code>.
              </span>
            </div>

            <div style={{ background: '#1e293b', padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>3. Exact Street Addresses & Door Codes</span>
                <span style={{ fontSize: '0.7rem', background: '#3b82f620', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>SECTOR SNAPPED</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Precise building and apartment numbers are generalized to tactical sector coordinates (e.g. Sector Alpha / Miami Marina Zone) to protect exact locations.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            background: '#1e293b',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#34d399' }}>
            <CheckCircle2 size={14} />
            <span>Audited for Google Cloud Vertex & Pub/Sub Ingestion</span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
