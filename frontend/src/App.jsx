import React, { useState } from 'react';
import UploadImage from './components/UploadImage';
import MetadataViewer from './components/MetadataViewer';
import GoogleMapViewer from './components/GoogleMapViewer';
import RiskMatrix from './components/RiskMatrix';
import MetadataEditor from './components/MetadataEditor';
import BackendStatus from './components/BackendStatus';

const S = {
  root: { minHeight: '100vh', background: 'var(--bg)', paddingBottom: '60px' },
  topbar: {
    background: 'var(--surface)', borderBottom: '1px solid var(--border)',
    padding: '0 28px', height: '58px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
  },
  logo: {
    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem',
    color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase',
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  logoDot: {
    width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)',
    boxShadow: '0 0 8px var(--accent)', animation: 'pulse 2s ease-in-out infinite',
  },
  topbarRight: { fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.05em' },
  page: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 0' },
  hero: { textAlign: 'center', marginBottom: '36px', paddingTop: '12px' },
  heroTag: {
    display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
    letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)',
    border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.06)',
    padding: '5px 16px', borderRadius: '999px', marginBottom: '18px',
  },
  heroTitle: {
    fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.2rem)',
    color: 'var(--text)', lineHeight: 1.15, marginBottom: '14px', letterSpacing: '-0.02em',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)',
    maxWidth: '560px', margin: '0 auto', lineHeight: 1.7,
  },
  uploadSection: { maxWidth: '680px', margin: '0 auto 40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px',
  },
  previewCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px',
    display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap',
  },
  imgThumb: {
    width: '120px', height: '90px', objectFit: 'cover',
    borderRadius: 'var(--radius)', border: '1px solid var(--border2)', flexShrink: 0,
  },
  previewInfo: { flex: 1, minWidth: '200px' },
  previewName: { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '6px', wordBreak: 'break-all' },
  previewMeta: { fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.8 },
  previewReset: {
    marginLeft: 'auto', background: 'none', border: '1px solid var(--border2)',
    borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem', padding: '6px 14px', cursor: 'pointer',
    textTransform: 'uppercase', letterSpacing: '0.05em', alignSelf: 'flex-start',
  },
  fullCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px', marginTop: '20px',
  },
};

const GlobalAnim = () => (
  <style>{`
    @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.85); } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    .result-section { animation: fadeIn 0.35s ease forwards; }
    button:hover { opacity: 0.85; }
  `}</style>
);

export default function App() {
  const [result, setResult] = useState(null);
  const lat = result?.metadata?.['GPS Latitude'];
  const lon = result?.metadata?.['GPS Longitude'];

  return (
    <div style={S.root}>
      <GlobalAnim />
      <header style={S.topbar}>
        <div style={S.logo}>
          <div style={S.logoDot} />
          EXIF · FORENSICS
        </div>
        <div style={S.topbarRight}>Image Metadata Analysis Tool v1.0</div>
      </header>

      <div style={S.page}>
        <div style={S.hero}>
          <div style={S.heroTag}>Cybersecurity · OSINT · Forensics</div>
          <h1 style={S.heroTitle}>Image <span style={S.heroAccent}>EXIF</span> Forensics</h1>
          <p style={S.heroSub}>Upload an image to extract metadata, detect GPS coordinates, identify security risks, inject or strip EXIF fields.</p>
        </div>

        <div style={S.uploadSection}>
          <BackendStatus />
          <UploadImage onResult={setResult} />
        </div>

        {result && (
          <div className="result-section">
            <div style={S.previewCard}>
              {result.preview && <img src={result.preview} alt="preview" style={S.imgThumb} />}
              <div style={S.previewInfo}>
                <div style={S.previewName}>{result.filename}</div>
                <div style={S.previewMeta}>
                  {result.metadata?.Width && result.metadata?.Height && `${result.metadata.Width} × ${result.metadata.Height}px`}
                  {result.metadata?.Format && ` · ${result.metadata.Format}`}
                  {result.metadata?.Mode && ` · ${result.metadata.Mode}`}
                  <br />
                  {Object.keys(result.metadata || {}).length} metadata fields extracted
                  {lat != null && lon != null && ` · 📍 GPS found`}
                </div>
              </div>
              <button style={S.previewReset} onClick={() => setResult(null)}>✕ Clear</button>
            </div>

            <div style={S.grid}>
              <div style={S.card}><RiskMatrix risk={result.risk} /></div>
              <div style={S.card}><GoogleMapViewer lat={lat} lon={lon} /></div>
              <div style={S.card}><MetadataEditor file={result.file} /></div>
            </div>

            <div style={S.fullCard}><MetadataViewer metadata={result.metadata} /></div>
          </div>
        )}
      </div>
    </div>
  );
}
