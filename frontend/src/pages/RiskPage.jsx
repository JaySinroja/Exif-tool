import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';

const HIGH_PATTERNS = [
  { pattern: '<script>', desc: 'XSS Script injection' },
  { pattern: 'onerror=', desc: 'HTML event handler injection' },
  { pattern: 'javascript:', desc: 'JavaScript URI scheme' },
  { pattern: 'alert(', desc: 'JS alert execution' },
  { pattern: "' OR", desc: 'SQL injection (OR-based)' },
  { pattern: 'DROP TABLE', desc: 'SQL DDL injection' },
  { pattern: 'UNION SELECT', desc: 'SQL UNION attack' },
  { pattern: 'eval(', desc: 'JS eval execution' },
  { pattern: '<iframe', desc: 'iframe injection' },
  { pattern: 'base64_decode', desc: 'Base64 payload obfuscation' },
];

const MEDIUM_PATTERNS = [
  { pattern: 'http(s)://', desc: 'External URL reference' },
  { pattern: '@domain.tld', desc: 'Email address embedded' },
  { pattern: 'x.x.x.x', desc: 'IP address in metadata' },
];

const RISK_SCANNED_FIELDS = [
  'UserComment', 'ImageDescription', 'XPComment', 'MakerNote',
  'Software', 'Artist', 'Copyright', 'Make', 'Model',
];

const levelCfg = {
  HIGH:   { color: 'var(--high)',  bg: 'var(--high-bg)',  icon: '🚨', bar: '#ff3d5a' },
  MEDIUM: { color: 'var(--med)',   bg: 'var(--med-bg)',   icon: '⚠️', bar: '#ffab00' },
  LOW:    { color: 'var(--low)',   bg: 'var(--low-bg)',   icon: '✅', bar: '#00e676' },
};

function RiskMeter({ level }) {
  const levels = ['LOW', 'MEDIUM', 'HIGH'];
  const idx = levels.indexOf(level);
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {levels.map((l, i) => (
        <div key={l} style={{ flex: 1 }}>
          <div style={{
            height: '8px', borderRadius: '4px',
            background: i <= idx ? levelCfg[l].bar : 'var(--border)',
            transition: 'background 0.4s ease',
          }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: i <= idx ? levelCfg[l].bar : 'var(--text-dim)', marginTop: '4px', textAlign: 'center' }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function PatternCard({ pattern, desc, level }) {
  const cfg = levelCfg[level];
  return (
    <div style={{
      background: cfg.bg, border: `1px solid ${cfg.color}30`,
      borderRadius: 'var(--radius)', padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: cfg.color, background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '4px', flexShrink: 0 }}>{pattern}</code>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</span>
    </div>
  );
}

export default function RiskPage({ result }) {
  const [activeTab, setActiveTab] = useState('overview');
  const risk = result?.risk;

  if (!result) return (
    <div className="page-enter">
      <PageHeader icon="◈" title="RISK ANALYSIS" subtitle="Upload an image on the Dashboard first to see risk results" tag="THREAT DETECTION · PAYLOAD ANALYSIS" />
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border2)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.4 }}>◈</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>NO IMAGE LOADED</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>Go to Dashboard → upload an image → return here</div>
      </div>
    </div>
  );

  const cfg = levelCfg[risk?.level] || levelCfg.LOW;
  const tabs = ['overview', 'findings', 'patterns'];

  return (
    <div className="page-enter">
      <PageHeader icon="◈" title="RISK ANALYSIS" subtitle={`Analyzing: ${result.filename}`} tag="THREAT DETECTION · PAYLOAD ANALYSIS" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            background: 'none', border: 'none', borderBottom: activeTab === t ? '2px solid var(--accent)' : '2px solid transparent',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em',
            color: activeTab === t ? 'var(--accent)' : 'var(--text-muted)',
            padding: '8px 16px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s',
            marginBottom: '-1px',
          }}>{t}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Big risk badge */}
          <div style={{
            background: cfg.bg, border: `1.5px solid ${cfg.color}40`,
            borderRadius: 'var(--radius-lg)', padding: '28px 32px',
            display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: '3rem' }}>{cfg.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: cfg.color, letterSpacing: '0.1em', marginBottom: '4px' }}>{risk.level} RISK</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '600px' }}>{risk.summary}</div>
            </div>
            <div style={{ minWidth: '200px', flex: 1 }}>
              <RiskMeter level={risk.level} />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            {[
              { label: 'Fields Scanned', value: RISK_SCANNED_FIELDS.length },
              { label: 'Findings', value: risk.findings?.length || 0, color: risk.findings?.length ? 'var(--high)' : 'var(--low)' },
              { label: 'HIGH Severity', value: risk.findings?.filter(f => f.level === 'HIGH').length || 0, color: 'var(--high)' },
              { label: 'MEDIUM Severity', value: risk.findings?.filter(f => f.level === 'MEDIUM').length || 0, color: 'var(--med)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: s.color || 'var(--accent)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Scanned fields list */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>Fields Scanned for Threats</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {RISK_SCANNED_FIELDS.map(f => {
                const finding = risk.findings?.find(fn => fn.field === f);
                return (
                  <span key={f} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                    padding: '4px 12px', borderRadius: '999px',
                    background: finding ? (finding.level === 'HIGH' ? 'var(--high-bg)' : 'var(--med-bg)') : 'var(--bg2)',
                    border: `1px solid ${finding ? (finding.level === 'HIGH' ? 'rgba(255,61,90,0.4)' : 'rgba(255,171,0,0.4)') : 'var(--border)'}`,
                    color: finding ? (finding.level === 'HIGH' ? 'var(--high)' : 'var(--med)') : 'var(--text-muted)',
                  }}>{finding ? `⚑ ${f}` : f}</span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FINDINGS */}
      {activeTab === 'findings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!risk.findings?.length ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--low-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,230,118,0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✅</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--low)', letterSpacing: '0.08em' }}>NO THREATS DETECTED</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>All scanned fields appear clean.</div>
            </div>
          ) : risk.findings.map((f, i) => {
            const c = levelCfg[f.level];
            return (
              <div key={i} style={{ background: c.bg, border: `1px solid ${c.color}35`, borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.7rem', background: c.color + '22', color: c.color, padding: '2px 10px', borderRadius: '999px', border: `1px solid ${c.color}40` }}>{f.level}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: c.color, letterSpacing: '0.05em' }}>{f.field}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', wordBreak: 'break-all', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>{f.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>Matched pattern: <code style={{ color: c.color }}>{f.matched_pattern}</code></div>
              </div>
            );
          })}
        </div>
      )}

      {/* PATTERNS REFERENCE */}
      {activeTab === 'patterns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--high)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--high)' }} /> HIGH RISK PATTERNS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {HIGH_PATTERNS.map(p => <PatternCard key={p.pattern} {...p} level="HIGH" />)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--med)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--med)' }} /> MEDIUM RISK PATTERNS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {MEDIUM_PATTERNS.map(p => <PatternCard key={p.pattern} {...p} level="MEDIUM" />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
