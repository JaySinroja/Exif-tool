import React, { useState } from 'react';

const PRIORITY_FIELDS = [
  'Make', 'Model', 'Software', 'DateTime', 'DateTimeOriginal',
  'GPS Latitude', 'GPS Longitude', 'ImageDescription', 'UserComment',
  'XPComment', 'MakerNote', 'Artist', 'Copyright',
  'Format', 'Width', 'Height', 'Mode',
];

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '0' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '16px',
  },
  title: { fontWeight: 700, fontSize: '1rem', color: 'var(--text)', letterSpacing: '0.02em' },
  count: {
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
    color: 'var(--accent)', background: 'rgba(0,229,255,0.08)',
    padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(0,229,255,0.2)',
  },
  search: {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem', padding: '8px 14px', marginBottom: '12px', outline: 'none',
    transition: 'border-color 0.15s',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th: {
    textAlign: 'left', padding: '8px 12px',
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)', background: 'var(--bg)',
  },
  trEven: { background: 'var(--surface)' },
  trOdd: { background: 'var(--surface2)' },
  tdKey: {
    padding: '7px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
    color: 'var(--accent)', whiteSpace: 'nowrap', verticalAlign: 'top',
    width: '38%',
  },
  tdVal: {
    padding: '7px 12px', color: 'var(--text)', wordBreak: 'break-all',
    verticalAlign: 'top', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
  },
  empty: {
    textAlign: 'center', padding: '32px', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
  },
  toggleBtn: {
    background: 'none', border: '1px solid var(--border2)', borderRadius: 'var(--radius)',
    color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    padding: '4px 12px', cursor: 'pointer', transition: 'all 0.15s', marginTop: '10px',
  },
};

export default function MetadataViewer({ metadata }) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  if (!metadata) return null;

  const entries = Object.entries(metadata);

  // Sort: priority fields first
  const sorted = [...entries].sort(([a], [b]) => {
    const ai = PRIORITY_FIELDS.indexOf(a);
    const bi = PRIORITY_FIELDS.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const filtered = sorted.filter(([k, v]) => {
    const q = search.toLowerCase();
    return k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q);
  });

  const displayedRaw = showAll ? filtered : filtered.slice(0, 25);
  const displayed = displayedRaw;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <span style={styles.title}>📋 Metadata Fields</span>
        <span style={styles.count}>{entries.length} fields</span>
      </div>
      <input
        style={styles.search}
        placeholder="Search fields…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
      />
      {displayed.length === 0 ? (
        <div style={styles.empty}>No matching fields found.</div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Value</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(([k, v], i) => (
                <tr key={k} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.tdKey}>{k}</td>
                  <td style={styles.tdVal}>{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 25 && (
            <button style={styles.toggleBtn} onClick={() => setShowAll(!showAll)}>
              {showAll ? `▲ Show fewer` : `▼ Show all ${filtered.length} fields`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
