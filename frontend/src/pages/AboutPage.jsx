import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';

const STACK = [
  { cat: 'Frontend', items: [
    { name: 'React 18', role: 'UI framework', icon: '⚛' },
    { name: 'Orbitron / Rajdhani / Share Tech Mono', role: 'Typography', icon: 'Aa' },
    { name: 'OpenStreetMap', role: 'GPS map embed', icon: '🗺' },
  ]},
  { cat: 'Backend', items: [
    { name: 'Flask 3', role: 'REST API server', icon: '🐍' },
    { name: 'Pillow (PIL)', role: 'Image processing', icon: '🖼' },
    { name: 'piexif', role: 'Deep EXIF parsing', icon: '🔬' },
    { name: 'Flask-CORS', role: 'Cross-origin support', icon: '🔗' },
  ]},
  { cat: 'Security', items: [
    { name: 'Pattern matching', role: 'XSS / SQL injection detection', icon: '◈' },
    { name: 'MIME validation', role: 'File type enforcement', icon: '🛡' },
    { name: 'Size limits', role: '10 MB max upload', icon: '⚖' },
    { name: 'In-memory processing', role: 'No disk writes', icon: '💾' },
  ]},
];

const FEATURES = [
  { icon: '📤', title: 'Image Upload', desc: 'Drag-and-drop or click to upload JPG/PNG images up to 10 MB.' },
  { icon: '🔬', title: 'EXIF Extraction', desc: 'Extracts 20+ fields including GPS, camera model, software, dates, and embedded comments.' },
  { icon: '🗺', title: 'GPS Mapping', desc: 'If GPS coordinates exist, they are plotted on an interactive map with a Google Maps deep-link.' },
  { icon: '◈', title: 'Risk Analysis', desc: 'Scans metadata for XSS payloads, SQL injection, embedded URLs, and IP addresses.' },
  { icon: '✏', title: 'Metadata Injection', desc: 'Add Author, Comment, and Description fields and download the modified image.' },
  { icon: '🗑', title: 'Metadata Strip', desc: 'Remove all EXIF data and download a clean, privacy-safe copy.' },
];

const TEAM = [
  { name: 'EXIF FORENSICS', role: 'Open-source OSINT & Security Tool', avatar: '⬡' },
];

export default function AboutPage() {
  const [openStack, setOpenStack] = useState(null);

  return (
    <div className="page-enter">
      <PageHeader icon="◎" title="ABOUT" subtitle="EXIF Forensics Tool — purpose, architecture and tech stack" tag="MISSION · STACK · SECURITY" />

      {/* Mission block */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,255,231,0.05) 0%, rgba(123,97,255,0.05) 100%)',
        border: '1px solid rgba(0,255,231,0.15)', borderRadius: 'var(--radius-lg)',
        padding: '32px', marginBottom: '28px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Corner decoration */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', borderLeft: '1px solid rgba(0,255,231,0.1)', borderBottom: '1px solid rgba(0,255,231,0.1)', borderBottomLeftRadius: '80px', pointerEvents: 'none' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: '14px' }}>// MISSION STATEMENT</div>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1.7, maxWidth: '680px' }}>
          EXIF Forensics is a cybersecurity tool designed for analysts, investigators, and privacy-conscious users who need to understand what data is embedded inside digital images.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '680px', marginTop: '14px' }}>
          Modern cameras and smartphones silently embed a wealth of information into every photo — GPS coordinates, device fingerprints, timestamps, and sometimes even injected payloads. This tool exposes that hidden layer and lets you analyze, modify, or eliminate it.
        </p>
      </div>

      {/* Features grid */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>// FEATURES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: '6px' }}>{f.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack — accordion */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>// TECHNOLOGY STACK</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {STACK.map(s => (
            <div key={s.cat} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <button onClick={() => setOpenStack(openStack === s.cat ? null : s.cat)} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--text)', letterSpacing: '0.08em' }}>{s.cat}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent)' }}>{openStack === s.cat ? '▲' : '▼'} {s.items.length} components</span>
              </button>
              {openStack === s.cat && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {s.items.map(item => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 10px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent)' }}>{item.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security notice */}
      <div style={{ background: 'var(--high-bg)', border: '1px solid rgba(255,61,90,0.25)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--high)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>// SECURITY DISCLAIMER</div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          This tool is intended for legitimate forensic analysis, educational purposes, and personal privacy protection.
          Images are processed entirely in memory — no files are stored on the server. Do not use this tool to analyze images you do not own or have permission to inspect.
        </p>
      </div>
    </div>
  );
}
