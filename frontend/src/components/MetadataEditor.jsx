import React, { useState } from 'react';
import { API_BASE } from '../api';

const styles = {
  title: { fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '16px', letterSpacing: '0.02em' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab: (active) => ({
    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700,
    padding: '7px 18px', borderRadius: 'var(--radius)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border2)'}`,
    background: active ? 'rgba(0,229,255,0.1)' : 'var(--surface)',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    cursor: 'pointer', transition: 'all 0.15s', textTransform: 'uppercase', letterSpacing: '0.05em',
  }),
  fieldGroup: { marginBottom: '14px' },
  label: {
    display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
  },
  input: {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--font-mono)',
    fontSize: '0.82rem', padding: '9px 14px', outline: 'none', transition: 'border-color 0.15s', resize: 'vertical',
  },
  btnRow: { display: 'flex', gap: '10px', marginTop: '18px' },
  btnPrimary: {
    flex: 1, background: 'var(--accent)', color: '#000', border: 'none',
    borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontWeight: 700,
    fontSize: '0.8rem', padding: '11px', cursor: 'pointer', transition: 'opacity 0.15s',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  btnDanger: {
    flex: 1, background: 'var(--high-bg)', color: 'var(--high)',
    border: '1px solid rgba(239,68,68,0.35)', borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem',
    padding: '11px', cursor: 'pointer', transition: 'all 0.15s',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  status: (ok) => ({
    marginTop: '12px', padding: '10px 14px',
    background: ok ? 'var(--low-bg)' : 'var(--high-bg)',
    border: `1px solid ${ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
    borderRadius: 'var(--radius)', color: ok ? 'var(--low)' : 'var(--high)',
    fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
  }),
  warning: {
    padding: '12px 16px', background: 'var(--med-bg)',
    border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius)',
    color: 'var(--med)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: 1.6,
  },
};

const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: 'spin2 0.8s linear infinite', verticalAlign: 'middle', marginRight: '6px' }}>
    <style>{`@keyframes spin2 { to { transform: rotate(360deg); } }`}</style>
    <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
    <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" />
  </svg>
);

export default function MetadataEditor({ file }) {
  const [tab, setTab] = useState('inject');
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  if (!file) return null;

  const downloadB64 = (dataUrl, filename) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  const handleInject = async () => {
    setLoading(true); setStatus(null);
    const form = new FormData();
    form.append('image', file);
    form.append('author', author);
    form.append('comment', comment);
    form.append('description', description);
    try {
      const res = await fetch(`${API_BASE}/inject`, { method: 'POST', body: form });
      const json = await res.json();
      if (json.error) { setStatus({ ok: false, msg: json.error }); return; }
      downloadB64(json.data, json.filename);
      setStatus({ ok: true, msg: `✓ Modified image saved as "${json.filename}"` });
    } catch {
      setStatus({ ok: false, msg: 'Network error — is Flask running?' });
    } finally { setLoading(false); }
  };

  const handleStrip = async () => {
    setLoading(true); setStatus(null);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch(`${API_BASE}/strip`, { method: 'POST', body: form });
      const json = await res.json();
      if (json.error) { setStatus({ ok: false, msg: json.error }); return; }
      downloadB64(json.data, json.filename);
      setStatus({ ok: true, msg: `✓ Stripped image saved as "${json.filename}"` });
    } catch {
      setStatus({ ok: false, msg: 'Network error — is Flask running?' });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={styles.title}>✏️ Metadata Editor</div>
      <div style={styles.tabs}>
        <button style={styles.tab(tab === 'inject')} onClick={() => { setTab('inject'); setStatus(null); }}>Inject</button>
        <button style={styles.tab(tab === 'strip')} onClick={() => { setTab('strip'); setStatus(null); }}>Strip</button>
      </div>

      {tab === 'inject' && (
        <>
          {[['Author', author, setAuthor], ['Comment', comment, setComment], ['Description', description, setDescription]].map(([field, val, setter]) => {
            const Tag = field === 'Author' ? 'input' : 'textarea';
            return (
              <div key={field} style={styles.fieldGroup}>
                <label style={styles.label}>{field}</label>
                <Tag
                  style={{ ...styles.input, minHeight: Tag === 'textarea' ? '70px' : undefined }}
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={`Enter ${field.toLowerCase()}…`}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            );
          })}
          <div style={styles.btnRow}>
            <button style={styles.btnPrimary} onClick={handleInject} disabled={loading}>
              {loading ? <><Spinner />Processing…</> : '⬇ Inject & Download'}
            </button>
          </div>
        </>
      )}

      {tab === 'strip' && (
        <>
          <div style={styles.warning}>
            ⚠️ This will permanently remove ALL EXIF metadata from the image and return a clean copy. The original file is not modified.
          </div>
          <div style={styles.btnRow}>
            <button style={styles.btnDanger} onClick={handleStrip} disabled={loading}>
              {loading ? <><Spinner />Stripping…</> : '🗑 Strip Metadata & Download'}
            </button>
          </div>
        </>
      )}

      {status && <div style={styles.status(status.ok)}>{status.msg}</div>}
    </div>
  );
}
