import React, { useRef, useState } from 'react';
import { API_BASE } from '../api';

const styles = {
  zone: {
    border: '2px dashed var(--border2)',
    borderRadius: 'var(--radius-lg)',
    padding: '48px 32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'var(--surface)',
    position: 'relative',
    overflow: 'hidden',
  },
  zoneActive: {
    borderColor: 'var(--accent)',
    background: 'rgba(0,229,255,0.04)',
    boxShadow: 'var(--glow-accent)',
  },
  icon: { fontSize: '3rem', marginBottom: '16px', display: 'block', opacity: 0.7 },
  title: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)', marginBottom: '8px' },
  sub: { fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  btn: {
    marginTop: '24px', display: 'inline-block', background: 'var(--accent)', color: '#000',
    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', padding: '10px 24px',
    borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
    letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'opacity 0.15s',
  },
  input: { display: 'none' },
  error: {
    marginTop: '12px', padding: '10px 16px', background: 'var(--high-bg)',
    border: '1px solid var(--high)', borderRadius: 'var(--radius)',
    color: 'var(--high)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
  },
  loading: {
    marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent)',
  },
};

const Spinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: 'spin 0.8s linear infinite' }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
    <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" />
  </svg>
);

export default function UploadImage({ onResult }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      setError('Only JPG and PNG images are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }
    setError('');
    setLoading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form });
      const json = await res.json();
      if (json.error) setError(json.error);
      else onResult({ ...json, file });
    } catch (e) {
      setError(
        `Could not reach backend at ${API_BASE}. ` +
        `Make sure Flask is running: python app.py`
      );
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      style={{ ...styles.zone, ...(dragging ? styles.zoneActive : {}) }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      <span style={styles.icon}>🔍</span>
      <div style={styles.title}>Drop an image to forensically analyze</div>
      <div style={styles.sub}>JPG / PNG · max 10 MB</div>
      <button style={styles.btn} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
        Select Image
      </button>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" style={styles.input}
        onChange={(e) => handleFile(e.target.files[0])} />
      {loading && (
        <div style={styles.loading}><Spinner /> Extracting EXIF metadata…</div>
      )}
      {error && <div style={styles.error}>⚠ {error}</div>}
    </div>
  );
}
