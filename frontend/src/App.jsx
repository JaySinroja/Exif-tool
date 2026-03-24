import React, { useState, useEffect } from 'react';
import { API_BASE } from './api';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RiskPage from './pages/RiskPage';
import MetadataEditorPage from './pages/MetadataEditorPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [result, setResult] = useState(null);
  const [backendOk, setBackendOk] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(d => setBackendOk(d.status === 'ok'))
      .catch(() => setBackendOk(false));
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard result={result} setResult={setResult} setPage={setPage} />;
      case 'risk':      return <RiskPage result={result} />;
      case 'metadata':  return <MetadataEditorPage result={result} />;
      case 'about':     return <AboutPage />;
      default:          return <Dashboard result={result} setResult={setResult} setPage={setPage} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePage={page} setPage={setPage} backendOk={backendOk} />

      {/* Main content — offset by sidebar width (240px default, 64px collapsed) */}
      <main style={{
        flex: 1,
        marginLeft: '240px',
        minHeight: '100vh',
        background: 'var(--bg)',
        transition: 'margin-left 0.25s ease',
      }}>
        {/* Top bar */}
        <div style={{
          height: '52px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>ROOT</span>
            <span style={{ color: 'var(--border2)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent)' }}>{page.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {result && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', background: 'var(--bg)', padding: '3px 10px', borderRadius: '999px', border: '1px solid var(--border)' }}>
                📎 {result.filename}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: backendOk ? 'var(--low)' : 'var(--high)' }}>
              {backendOk ? '● ONLINE' : '● OFFLINE'}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '32px 32px 60px', maxWidth: '1100px' }}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
