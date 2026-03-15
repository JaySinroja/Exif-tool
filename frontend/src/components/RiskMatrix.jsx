import React, { useState } from 'react';

const LEVEL_CONFIG = {
  LOW: {
    color: 'var(--low)', bg: 'var(--low-bg)', border: 'rgba(34,197,94,0.3)',
    icon: '✅', label: 'LOW RISK', glow: '0 0 20px rgba(34,197,94,0.2)',
  },
  MEDIUM: {
    color: 'var(--med)', bg: 'var(--med-bg)', border: 'rgba(245,158,11,0.3)',
    icon: '🔶', label: 'MEDIUM RISK', glow: '0 0 20px rgba(245,158,11,0.2)',
  },
  HIGH: {
    color: 'var(--high)', bg: 'var(--high-bg)', border: 'rgba(239,68,68,0.35)',
    icon: '🚨', label: 'HIGH RISK', glow: 'var(--glow-high)',
  },
};

const styles = {
  title: { fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '16px', letterSpacing: '0.02em' },
  badge: (cfg) => ({
    display: 'inline-flex', alignItems: 'center', gap: '10px',
    padding: '14px 22px',
    background: cfg.bg,
    border: `1.5px solid ${cfg.border}`,
    borderRadius: 'var(--radius-lg)',
    boxShadow: cfg.glow,
    marginBottom: '16px',
  }),
  badgeIcon: { fontSize: '1.5rem' },
  badgeLabel: (cfg) => ({
    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem',
    color: cfg.color, letterSpacing: '0.1em',
  }),
  summary: {
    fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
    color: 'var(--text-muted)', lineHeight: 1.7,
    padding: '12px 16px', background: 'var(--bg)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    marginBottom: '16px',
  },
  findingsTitle: {
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '10px',
  },
  finding: (level) => ({
    padding: '12px 14px', borderRadius: 'var(--radius)',
    border: `1px solid ${LEVEL_CONFIG[level].border}`,
    background: LEVEL_CONFIG[level].bg,
    marginBottom: '8px',
  }),
  findingField: (level) => ({
    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem',
    color: LEVEL_CONFIG[level].color, marginBottom: '4px',
  }),
  findingVal: {
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
    color: 'var(--text-muted)', wordBreak: 'break-all',
  },
  findingPattern: {
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
    color: 'var(--text-dim)', marginTop: '4px',
  },
  meter: {
    display: 'flex', gap: '6px', marginBottom: '18px', alignItems: 'center',
  },
  meterBar: (active, level) => ({
    flex: 1, height: '6px', borderRadius: '3px',
    background: active ? LEVEL_CONFIG[level].color : 'var(--border)',
    transition: 'background 0.3s ease',
  }),
  expandBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', cursor: 'pointer',
    padding: '4px 0', marginBottom: '10px',
  },
};

export default function RiskMatrix({ risk }) {
  const [expanded, setExpanded] = useState(false);
  if (!risk) return null;

  const cfg = LEVEL_CONFIG[risk.level] || LEVEL_CONFIG.LOW;
  const levels = ['LOW', 'MEDIUM', 'HIGH'];
  const activeIdx = levels.indexOf(risk.level);

  return (
    <div>
      <div style={styles.title}>🛡️ Risk Analysis</div>

      {/* Risk meter */}
      <div style={styles.meter}>
        {levels.map((l, i) => (
          <div key={l} style={styles.meterBar(i <= activeIdx, l)} title={l} />
        ))}
      </div>

      {/* Badge */}
      <div style={styles.badge(cfg)}>
        <span style={styles.badgeIcon}>{cfg.icon}</span>
        <span style={styles.badgeLabel(cfg)}>{cfg.label}</span>
      </div>

      {/* Summary */}
      <div style={styles.summary}>{risk.summary}</div>

      {/* Findings */}
      {risk.findings && risk.findings.length > 0 && (
        <>
          <button style={styles.expandBtn} onClick={() => setExpanded(!expanded)}>
            {expanded ? '▲ Hide' : '▼ Show'} {risk.findings.length} finding{risk.findings.length > 1 ? 's' : ''}
          </button>
          {expanded && (
            <div>
              <div style={styles.findingsTitle}>Detected Patterns</div>
              {risk.findings.map((f, i) => (
                <div key={i} style={styles.finding(f.level)}>
                  <div style={styles.findingField(f.level)}>
                    [{f.level}] {f.field}
                  </div>
                  <div style={styles.findingVal}>{f.value}</div>
                  <div style={styles.findingPattern}>Matched: {f.matched_pattern}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
