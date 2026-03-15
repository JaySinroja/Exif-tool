import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function BackendStatus() {
  const [status, setStatus] = useState('checking'); // checking | ok | error

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000); // 4s timeout

    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { clearTimeout(timer); setStatus(d.status === 'ok' ? 'ok' : 'error'); })
      .catch(() => { clearTimeout(timer); setStatus('error'); });

    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  const s = {
    wrap: {
      borderRadius: '10px',
      padding: '11px 16px',
      marginBottom: '14px',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      lineHeight: 1.6,
    },
    ok: {
      background: 'rgba(34,197,94,0.08)',
      border: '1px solid rgba(34,197,94,0.3)',
      color: 'var(--low)',
    },
    checking: {
      background: 'rgba(245,158,11,0.08)',
      border: '1px solid rgba(245,158,11,0.25)',
      color: 'var(--med)',
    },
    error: {
      background: 'var(--high-bg)',
      border: '1px solid rgba(239,68,68,0.4)',
      color: 'var(--high)',
    },
    code: {
      background: 'rgba(0,0,0,0.35)',
      padding: '1px 7px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      display: 'inline-block',
    },
    dot: (color) => ({
      width: '8px', height: '8px', borderRadius: '50%',
      background: color, flexShrink: 0, marginTop: '5px',
      boxShadow: `0 0 6px ${color}`,
    }),
  };

  if (status === 'ok') return (
    <div style={{ ...s.wrap, ...s.ok }}>
      <div style={s.dot('var(--low)')} />
      <span>Flask backend connected at <code style={s.code}>{API_BASE}</code> ✓</span>
    </div>
  );

  if (status === 'checking') return (
    <div style={{ ...s.wrap, ...s.checking }}>
      <div style={s.dot('var(--med)')} />
      <span>Connecting to backend at <code style={s.code}>{API_BASE}</code>…</span>
    </div>
  );

  // Error state — show full troubleshooting guide
  return (
    <div style={{ ...s.wrap, ...s.error, flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={s.dot('var(--high)')} />
        <strong>Flask backend not reachable at <code style={s.code}>{API_BASE}</code></strong>
      </div>
      <div style={{ paddingLeft: '18px', marginTop: '6px', color: '#fca5a5' }}>
        <div>1. Make sure Flask is running:</div>
        <code style={{ ...s.code, margin: '4px 0', display: 'block' }}>cd backend &amp;&amp; python app.py</code>
        <div style={{ marginTop: '6px' }}>2. If React and Flask are on <strong>different networks</strong> (e.g. WSL2),
        edit <code style={s.code}>frontend/src/api.js</code> and replace <code style={s.code}>localhost</code> with
        your Windows IP shown in the Flask startup log:</div>
        <code style={{ ...s.code, margin: '4px 0', display: 'block' }}>export const API_BASE = "http://YOUR_WINDOWS_IP:5000";</code>
        <div style={{ marginTop: '6px' }}>3. If you see <strong>ECONNREFUSED</strong> in React terminal, it's a
        network isolation issue between WSL2 and Windows — use the LAN IP above.</div>
      </div>
    </div>
  );
}
