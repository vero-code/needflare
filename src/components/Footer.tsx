import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: '#0f172a',
        borderTop: '1px solid #1e293b',
        padding: '1rem 2rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b',
      }}
    >
      © 2026 NeedFlare · Developed by{' '}
      <a
        style={{ color: '#cbd5e1', textDecoration: 'none' }}
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/vero-code"
      >
        Veronika Kashtanova
      </a>{' '}
      for{' '}
      <a
        style={{ color: '#cbd5e1', textDecoration: 'none' }}
        target="_blank"
        rel="noopener noreferrer"
        href="https://devpost.com/software/needflare"
      >
        All Things Agentic Hackathon
      </a>
    </footer>
  );
};
