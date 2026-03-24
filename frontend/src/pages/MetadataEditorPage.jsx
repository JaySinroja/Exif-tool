import React, { useState } from 'react';
import { API_BASE } from '../api';
import PageHeader from '../components/PageHeader';

const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ animation: 'spin 0.8s linear infinite', verticalAlign: 'middle', marginRight: '6px' }}>
    <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
    <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" />
  </svg>
);

function Field({ label, hint, value, onChange, multiline }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</label>
        {hint && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>{hint}</span>}
      </div>
      <Tag value={value} onChange={e => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}…`}
        style={{
          width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem', padding: '10px 14px', outline: 'none',
          transition: 'border-color 0.15s', resize: multiline ? 'vertical' : 'none',
          minHeight: multiline ? '80px' : undefined,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}

function StatusBar({ ok, msg }) {
  if (!msg) return null;
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--radius)', marginTop: '12px',
      background: ok ? 'var(--low-bg)' : 'var(--high-bg)',
      border: `1px solid ${ok ? 'rgba(0,230,118,0.3)' : 'rgba(255,61,90,0.3)'}`,
      color: ok ? 'var(--low)' : 'var(--high)',
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
    }}>{msg}</div>
  );
}

const downloadB64 = (dataUrl, filename) => {
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename; a.click();
};

export default function MetadataEditorPage({ result }) {
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [stripLoading, setStripLoading] = useState(false);
  const [stripStatus, setStripStatus] = useState(null);

  const file = result?.file;

  const handleInject = async () => {
    if (!file) return;
    setLoading(true); setStatus(null);
    const form = new FormData();
    form.append('image', file);
    form.append('author', author);
    form.append('comment', comment);
    form.append('description', description);
    try {
      const res = await fetch(`${API_BASE}/inject`, { method: 'POST', body: form });
      const json = await res.json();
      if (json.error) { setStatus({ ok: false, msg: '✗ ' + json.error }); return; }
      downloadB64(json.data, json.filename);
      setStatus({ ok: true, msg: `✓ Saved as "${json.filename}"` });
    } catch { setStatus({ ok: false, msg: '✗ Network error — is Flask running?' }); }
    finally { setLoading(false); }
  };

  const handleStrip = async () => {
    if (!file) return;
    setStripLoading(true); setStripStatus(null);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch(`${API_BASE}/strip`, { method: 'POST', body: form });
      const json = await res.json();
      if (json.error) { setStripStatus({ ok: false, msg: '✗ ' + json.error }); return; }
      downloadB64(json.data, json.filename);
      setStripStatus({ ok: true, msg: `✓ Clean image saved as "${json.filename}"` });
    } catch { setStripStatus({ ok: false, msg: '✗ Network error.' }); }
    finally { setStripLoading(false); }
  };

  const noImage = (
    <div className="page-enter">
      <PageHeader icon="≡" title="METADATA EDITOR" subtitle="Upload an image on the Dashboard first" tag="INJECT · STRIP · MODIFY" />
      <div style={{ textAlign: 'center', padding: '60px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border2)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.4 }}>≡</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>NO IMAGE LOADED</div>
      </div>
    </div>
  );

  if (!result) return noImage;

  return (
    <div className="page-enter">
      <PageHeader icon="≡" title="METADATA EDITOR" subtitle={`Editing: ${result.filename}`} tag="INJECT · STRIP · MODIFY" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

        {/* INJECT PANEL */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,255,231,0.08)', border: '1px solid rgba(0,255,231,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>+</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)', letterSpacing: '0.06em' }}>INJECT METADATA</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Write custom fields into the image</div>
            </div>
          </div>

          <Field label="Author" hint="EXIF: Artist" value={author} onChange={setAuthor} />
          <Field label="Comment" hint="EXIF: UserComment" value={comment} onChange={setComment} multiline />
          <Field label="Description" hint="EXIF: ImageDescription" value={description} onChange={setDescription} multiline />

          <button onClick={handleInject} disabled={loading || !file} style={{
            width: '100%', background: 'var(--accent)', color: '#000', border: 'none',
            borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontWeight: 700,
            fontSize: '0.8rem', padding: '12px', letterSpacing: '0.1em', marginTop: '4px',
            opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? <><Spinner />PROCESSING…</> : '⬇ INJECT & DOWNLOAD'}
          </button>
          <StatusBar {...(status || {})} msg={status?.msg} />
        </div>

        {/* STRIP PANEL */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,61,90,0.08)', border: '1px solid rgba(255,61,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✕</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)', letterSpacing: '0.06em' }}>STRIP METADATA</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Remove all EXIF from the image</div>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--med-bg)', border: '1px solid rgba(255,171,0,0.25)', borderRadius: 'var(--radius)', marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--med)', lineHeight: 1.7 }}>
              ⚠ This will remove ALL metadata from a copy of the image:<br />
              GPS, camera info, timestamps, comments, software tags.<br />
              The original file on your device is NOT modified.
            </div>
          </div>

          {/* What will be removed */}
          {result?.metadata && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                Fields that will be removed ({Object.keys(result.metadata).length})
              </div>
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Object.keys(result.metadata).map(k => (
                  <span key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 7px', color: 'var(--text-muted)' }}>{k}</span>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleStrip} disabled={stripLoading || !file} style={{
            width: '100%', background: 'var(--high-bg)', color: 'var(--high)',
            border: '1px solid rgba(255,61,90,0.4)', borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem',
            padding: '12px', letterSpacing: '0.1em',
            opacity: stripLoading ? 0.7 : 1, cursor: stripLoading ? 'not-allowed' : 'pointer',
          }}>
            {stripLoading ? <><Spinner />STRIPPING…</> : '🗑 STRIP ALL METADATA & DOWNLOAD'}
          </button>
          <StatusBar {...(stripStatus || {})} msg={stripStatus?.msg} />
        </div>
      </div>

      {/* Current metadata quick view */}
      {result?.metadata && (
        <div style={{ marginTop: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>Current Metadata Preview</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '6px' }}>
            {Object.entries(result.metadata).slice(0, 18).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: '8px', padding: '6px 10px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent)', flexShrink: 0, minWidth: '80px' }}>{k}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
