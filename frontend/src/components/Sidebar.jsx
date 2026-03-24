import React, { useState } from 'react';

const NAV = [
  { id: 'dashboard',   icon: '⬡', label: 'Dashboard',      sub: 'Upload & Analyze' },
  { id: 'risk',        icon: '◈', label: 'Risk Analysis',   sub: 'Threat Detection' },
  { id: 'metadata',    icon: '≡', label: 'Metadata Editor', sub: 'Inject & Strip' },
  { id: 'about',       icon: '◎', label: 'About',           sub: 'Mission & Stack' },
];

export default function Sidebar({ activePage, setPage, backendOk }) {
  const [collapsed, setCollapsed] = useState(false);

  const w = collapsed ? '64px' : '240px';

  return (
    <aside style={{
      width: w, minHeight: '100vh', background: 'var(--surface)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease', position: 'fixed', left: 0, top: 0, bottom: 0,
      zIndex: 200, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '24px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: '72px',
      }}>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.2em' }}>
              EXIF
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
              FORENSICS
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          background: 'none', border: '1px solid var(--border2)', borderRadius: 'var(--radius)',
          color: 'var(--text-muted)', width: '28px', height: '28px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
          transition: 'all 0.15s', flexShrink: 0,
        }}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Backend status pill */}
      {!collapsed && (
        <div style={{
          margin: '12px 16px', padding: '7px 12px', borderRadius: 'var(--radius)',
          background: backendOk ? 'rgba(0,230,118,0.07)' : 'rgba(255,61,90,0.07)',
          border: `1px solid ${backendOk ? 'rgba(0,230,118,0.25)' : 'rgba(255,61,90,0.25)'}`,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: backendOk ? 'var(--low)' : 'var(--high)',
            animation: 'pulse-dot 2s infinite', color: backendOk ? 'var(--low)' : 'var(--high)',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: backendOk ? 'var(--low)' : 'var(--high)' }}>
            {backendOk ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV.map(item => {
          const active = activePage === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : '14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '14px 0' : '12px 20px',
              background: active ? 'rgba(0,255,231,0.07)' : 'none',
              border: 'none', borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              borderRight: 'none', borderTop: 'none', borderBottom: 'none',
              cursor: 'pointer', transition: 'all 0.15s', marginBottom: '2px',
            }}>
              <span style={{
                fontSize: '1.1rem', color: active ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.15s', flexShrink: 0,
              }}>{item.icon}</span>
              {!collapsed && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.85rem',
                    color: active ? 'var(--accent)' : 'var(--text)', letterSpacing: '0.04em',
                  }}>{item.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    {item.sub}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '16px 20px', borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)',
          lineHeight: 1.8,
        }}>
          <div>v1.0.0 · MIT License</div>
          <div>Flask · React · Pillow</div>
        </div>
      )}
    </aside>
  );
}
