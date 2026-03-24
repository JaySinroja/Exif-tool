import React from 'react';

export default function PageHeader({ icon, title, subtitle, tag }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '32px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0,
          background: 'rgba(0,255,231,0.07)', border: '1px solid rgba(0,255,231,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
        }}>{icon}</div>
        <div>
          {tag && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.2em',
              color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px',
            }}>{tag}</div>
          )}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem',
            color: 'var(--text)', letterSpacing: '0.06em', lineHeight: 1.2,
          }}>{title}</h1>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)',
            marginTop: '6px', lineHeight: 1.6,
          }}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
