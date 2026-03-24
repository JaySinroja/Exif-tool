import React, { useState } from 'react';
import { API_BASE } from '../api';
import PageHeader from '../components/PageHeader';
import MetadataViewer from '../components/MetadataViewer';
import GoogleMapViewer from '../components/GoogleMapViewer';

const Spinner = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
    style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
    <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" />
  </svg>
);

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '18px 20px', flex: 1, minWidth: '130px',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: color || 'var(--accent)' }}>{value}</div>
    </div>
  );
}

export default function Dashboard({ result, setResult, setPage }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = React.useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext)) { setError('Only JPG and PNG supported.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Max file size is 10 MB.'); return; }
    setError(''); setLoading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form });
      const json = await res.json();
      if (json.error) setError(json.error);
      else setResult({ ...json, file });
    } catch { setError('Cannot reach backend. Is Flask running?'); }
    finally { setLoading(false); }
  };

  const lat = result?.metadata?.['GPS Latitude'];
  const lon = result?.metadata?.['GPS Longitude'];
  const fieldCount = result ? Object.keys(result.metadata || {}).length : 0;
  const riskLevel = result?.risk?.level || '—';
  const riskColor = riskLevel === 'HIGH' ? 'var(--high)' : riskLevel === 'MEDIUM' ? 'var(--med)' : riskLevel === 'LOW' ? 'var(--low)' : 'var(--text-muted)';

  return (
    <div className="page-enter">
      <PageHeader icon="⬡" title="DASHBOARD" subtitle="Upload an image to begin forensic metadata analysis" tag="EXIF · FORENSICS · OSINT" />

      {/* Upload Zone */}
      {!result && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border2)'}`,
            borderRadius: 'var(--radius-lg)', padding: '60px 40px', textAlign: 'center',
            cursor: 'pointer', background: dragging ? 'rgba(0,255,231,0.03)' : 'var(--surface)',
            boxShadow: dragging ? 'var(--glow)' : 'none', transition: 'all 0.2s',
            marginBottom: '24px',
          }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.6 }}>🔬</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', marginBottom: '8px', letterSpacing: '0.08em' }}>
            DROP IMAGE TO ANALYZE
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            JPG / PNG · MAX 10 MB
          </div>
          <button style={{
            background: 'var(--accent)', color: '#000', border: 'none',
            borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontWeight: 700,
            fontSize: '0.8rem', padding: '10px 28px', letterSpacing: '0.1em',
          }}>SELECT IMAGE</button>
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
          {loading && <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)' }}><Spinner /> Extracting metadata…</div>}
          {error && <div style={{ marginTop: '14px', padding: '10px', background: 'var(--high-bg)', border: '1px solid rgba(255,61,90,0.3)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--high)' }}>⚠ {error}</div>}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Image preview + stats */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flex: 2, minWidth: '280px' }}>
              {result.preview && <img src={result.preview} alt="preview" style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '6px', wordBreak: 'break-all' }}>{result.filename}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.9 }}>
                  {result.metadata?.Width}×{result.metadata?.Height}px · {result.metadata?.Format} · {result.metadata?.Mode}<br />
                  {fieldCount} metadata fields · {lat != null ? '📍 GPS found' : 'No GPS'}
                </div>
              </div>
              <button onClick={() => setResult(null)} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '6px 12px', alignSelf: 'flex-start' }}>✕ CLEAR</button>
            </div>

            <StatCard label="Metadata Fields" value={fieldCount} />
            <StatCard label="Risk Level" value={riskLevel} color={riskColor} />
            <StatCard label="GPS" value={lat != null ? 'FOUND' : 'NONE'} color={lat != null ? 'var(--low)' : 'var(--text-muted)'} />
          </div>

          {/* Action shortcuts */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {[
              { label: '▶ VIEW RISK ANALYSIS', page: 'risk', color: riskColor },
              { label: '▶ EDIT METADATA', page: 'metadata', color: 'var(--accent)' },
            ].map(btn => (
              <button key={btn.page} onClick={() => setPage(btn.page)} style={{
                background: 'var(--surface)', border: `1px solid ${btn.color}30`,
                borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                color: btn.color, padding: '8px 18px', letterSpacing: '0.08em', transition: 'all 0.15s',
              }}>{btn.label}</button>
            ))}
          </div>

          {/* Map */}
          {lat != null && lon != null && (
            <div style={{ marginBottom: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <GoogleMapViewer lat={lat} lon={lon} />
            </div>
          )}

          {/* Metadata table */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <MetadataViewer metadata={result.metadata} />
          </div>
        </>
      )}
    </div>
  );
}
